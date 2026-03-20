import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function run() {
    console.log("Fetching all FISMAT SERIES_POWER tryouts via Prisma...")
    const tryouts = await prisma.tryout.findMany({
        where: {
            subject: "FISMAT",
            category: "SERIES_POWER",
            isPractice: true
        },
        orderBy: {
            createdAt: "asc"
        },
        select: { id: true, title: true }
    })

    console.log(`Found ${tryouts.length} tryouts. Updating titles and practicePart...`)
    
    for (let i = 0; i < tryouts.length; i++) {
        const tryout = tryouts[i]
        const newPartNum = i + 1
        const newTitle = `Latihan Soal Deret Tak Hingga dan Deret Pangkat Part ${newPartNum}`
        
        await prisma.tryout.update({
            where: { id: tryout.id },
            data: { 
                title: newTitle,
                practicePart: newPartNum
            }
        })
            
        console.log(`Updated ${tryout.title} -> ${newTitle} (Part ${newPartNum})`)
    }
    
    console.log("DONE renaming Tryouts.")
}
run().catch(console.error).finally(() => prisma.$disconnect())
