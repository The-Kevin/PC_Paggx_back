import { Request, Response, Router } from 'express';
import prisma from '../database/connection'
import PrismaInstance from '../database/connection'
import multer from 'multer';
import axios from 'axios'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() });

router.route('/identification/type').get(async (req: Request, res: Response) => {
    const data = await prisma.identificationType.findMany({
        include: {
            IdentificationTypeMetadata: true
        }
    })

    res.status(200).json(
        data.map(({ id, name, imageIconLink, IdentificationTypeMetadata }) => ({
            id,
            name,
            imageIconLink,
            pageTitle: IdentificationTypeMetadata.pageTitle,
            pageImageCardLink: IdentificationTypeMetadata.pageImageCardLink
        })))
})

router.post('/identification/type', async (req: Request, res: Response): Promise<void> => {
    const data = await PrismaInstance.identificationType.create({
        data: {
            name: req.body.name,
            imageIconLink: req.body.imageIconLink,
            type: req.body.type,
            IdentificationTypeMetadata: {
                connectOrCreate: {
                    where: { // need validation
                        id: req.body?.metadataId || ""
                    },
                    create: {
                        pageTitle: req.body?.pageTitle,
                        pageImageCardLink: req.body?.pageImageCardLink
                    }
                }
            }
        },
        include: {
            IdentificationTypeMetadata: true
        },
    })


    res.status(201).json({
        id: data.id,
        name: data.name,
        type: data.type,
        imageIconLink: data.imageIconLink,
        pageTitle: data.IdentificationTypeMetadata.pageTitle,
        pageImageCardLink: data.IdentificationTypeMetadata.pageImageCardLink
    })
})

router.post('/upload/self', upload.fields([
    {
        name: 'firstImage',
        maxCount: 1
    },
    {
        name: 'secondImage',
        maxCount: 1
    },
    {
        name: 'thirdImage',
        maxCount: 1
    }
]), async (req, res) => {

    const identificationId = req.body.identificationId

    const firstImage = req.files['firstImage']?.[0]
    const secondImage = req.files['secondImage']?.[0]
    const thirdImage = req.files['thirdImage']?.[0]

    const identification = await PrismaInstance.identification.findUnique({
        where: {
            id: identificationId
        },
        include: {
            files: true
        }
    })


    if (!firstImage || !secondImage || !thirdImage || !identification) {
        res.status(400).send("Wrong uploaded image")
        return
    }

    const previousSelfImages = identification.files.filter(file => file.name === 'SELF_IMAGE')
    if (previousSelfImages.length > 0) {
        res.status(400).send("Self already capured")
        return
    }

    const base64FirstImage = firstImage.buffer.toString('base64')
    const base64DocumentImage = Buffer.from(identification.files.find(file => file.name === 'FRONT_DOCUMENT_IMAGE').content).toString('base64')

    const { data } = await axios.post(process.env.BDC_URL + '/biometrias/facematch', {
        "Parameters": [`BASE_FACE_IMG=${base64FirstImage}`, `MATCH_IMG=${base64DocumentImage}`]

    }, {
        headers: {
            AccessToken: process.env.BDC_TOKEN
        }
    })

    if (data.ResultCode != -800 && data.ResultCode != 80) {
        res.status(400).send("Wrong uploaded image")
        return
    }

    const result = await PrismaInstance.identification.update({
        where: {
            id: identification.id
        },
        data: {
            bigDecision: data.ResultMessage,
            similarity: parseFloat(data.EstimatedInfo['Similarity']),
            files: {
                createMany: {
                    data: [
                        {
                            name: "SELF_IMAGE",
                            mimeType: firstImage.mimetype,
                            size: firstImage.size,
                            content: firstImage.buffer
                        },
                        {
                            name: "SELF_IMAGE",
                            mimeType: secondImage.mimetype,
                            size: secondImage.size,
                            content: secondImage.buffer
                        },
                        {
                            name: "SELF_IMAGE",
                            mimeType: thirdImage.mimetype,
                            size: thirdImage.size,
                            content: thirdImage.buffer
                        },
                    ]
                }
            }
        }
    })

    res.status(200).json({
        id: result.id
    })

})

router.post('/upload/documents', upload.fields([
    {
        name: 'frontDocumentImage',
        maxCount: 1
    },
    {
        name: 'backDocumentImage',
        maxCount: 1
    }
]), async (req: Request, res: Response): Promise<void> => {

    const frontDocument = req.files['frontDocumentImage']?.[0]
    const backDocument = req.files['backDocumentImage']?.[0]
    const identificationTypeId = req.body.identificationTypeId

    const identificationType = await PrismaInstance.identificationType.findUnique({
        where: {
            id: identificationTypeId
        }
    })

    if (!frontDocument || !backDocument || !identificationType) {
        res.status(400).send('Files not uploaded properly.');
        return
    }

    const frontBase64 = frontDocument.buffer.toString('base64');

    const documentInfoResult = await axios.post(process.env.BDC_URL + '/documentoscopia/checar', {
        "Parameters": [`DOC_IMG=${frontBase64}`, `DOC_TYPE=${identificationType.type}`]

    }, {
        headers: {
            AccessToken: process.env.BDC_TOKEN
        }
    })

    if (documentInfoResult.status != 200) {
        res.status(500).send('Something is wrong! Please try again later')
        return
    }

    //need increment new types them
    const { CNHNUMBER, CPF } = documentInfoResult.data['DocInfo']

    if (parseInt(documentInfoResult.data['ResultCode']) != 70 || (!CNHNUMBER && !CPF)) {
        res.status(400).send('Invalid documents')
        return
    }

    const identification = await PrismaInstance.identification.create({
        data: {
            document: CPF || CNHNUMBER,
            IdentificationType: {
                connect: {
                    id: identificationType.id
                }
            },
            files: {
                createMany: {
                    data: [{
                        name: 'FRONT_DOCUMENT_IMAGE',
                        mimeType: frontDocument.mimetype,
                        size: frontDocument.size,
                        content: frontDocument.buffer
                    }, {
                        name: 'BACK_DOCUMENT_IMAGE',
                        mimeType: backDocument.mimetype,
                        size: backDocument.size,
                        content: backDocument.buffer
                    }]
                }
            }
        },
    })


    res.status(200).json({
        id: identification.id
    })
})

export default router