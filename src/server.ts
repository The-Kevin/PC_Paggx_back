import express, { Request, Response } from 'express'
import PrismaInstance from './database/connection'
import { exit } from 'process'

const PORT = process.env.PORT || 8080

const server = express()
server.use(express.json());


server.get('/indentification/type', async (req: Request, res: Response): Promise<void> => {
    const data = await PrismaInstance.identificationType.findMany({
        include: {
            IdentificationTypeMetadata: true
        }
    })

    res.status(200).json(
        data.map(({ id, type, IdentificationTypeMetadata }) => ({
            id,
            type,
            pageTitle: IdentificationTypeMetadata.pageTitle,
            pageImageLink: IdentificationTypeMetadata.pageImageLink
        }))
    )

})

server.post('/indentification/type', async (req: Request, res: Response): Promise<void> => {
    const data = await PrismaInstance.identificationType.create({
        data: {
            type: req.body.type,
            IdentificationTypeMetadata: {
                connectOrCreate: {
                    where: {
                        id: req.body?.metadataId || ""
                    },
                    create: {
                        pageTitle: req.body?.pageTitle,
                        pageImageLink: req.body?.pageImageLink
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
        type: data.type,
        pageTitle: data.IdentificationTypeMetadata.pageTitle,
        pageImageLink: data.IdentificationTypeMetadata.pageImageLink
    })


})

server.listen(PORT, () => {
    console.log(`The server is running on ${PORT} port\n`)
})