import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Checking User...")
    const user = await prisma.user.findFirst()
    if (!user) {
        console.error("No users found in database!")
        return
    }
    console.log("Using User:", user.id)

    console.log("Testing Group Creation...")
    const group = await prisma.group.create({
      data: {
        name: "Test Group",
        description: "Health check",
        category: "other",
        members: {
          create: [
            { userId: user.id, role: "admin" }
          ]
        }
      }
    })
    console.log("Success! Group ID:", group.id)
  } catch (e: any) {
    console.error("FAIL:", e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
