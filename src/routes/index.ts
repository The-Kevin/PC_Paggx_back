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
        imageIconLink: data.imageIconLink,
        pageTitle: data.IdentificationTypeMetadata.pageTitle,
        pageImageCardLink: data.IdentificationTypeMetadata.pageImageCardLink
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

    if (!frontDocument || !backDocument) {
        res.status(400).send('Files not uploaded properly.');
        return
    }

    const frontBase64 = frontDocument.buffer.toString('base64');

    const documentInfoResult = await axios.post(process.env.BDC_URL + '/documentoscopia/checar', {
        "Parameters": [`DOC_IMG=${frontBase64}`]

    }, {
        headers: {
            AccessToken: process.env.BDC_TOKEN
        }
    })

    if (documentInfoResult.status != 200) {
        res.status(500).send('Something is wrong! Please try again later')
    }

    //need increment new types them
    const { CNHNUMBER, CPF } = documentInfoResult.data['DocInfo']

    const identification = await PrismaInstance.identification.create({
        data: {
            document: CPF || CNHNUMBER,
            documentType: CPF ? 'CPF' : 'CNH',
            IdentificationType: {
                connect: {
                    id: req.body.identificationTypeId
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