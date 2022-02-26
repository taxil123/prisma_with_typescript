import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express from 'express'

const prisma = new PrismaClient()
const app = express()

app.use(express.json())
app.use(cors())

app.get('/aggregations',async(req,res)=>{
  const distinctScores = await prisma.play.findMany({
    distinct: ['playerId', 'gameId'],
    orderBy: {
      score: 'desc',
    },
    select: {
      score: true,
      game: {
        select: {
          name: true,
        },
      },
      player: {
        select: {
          name: true,
        },
      },
    },
  })
  console.log(distinctScores)
})

app.get('/draft_posts', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: false },
    select: {
     
      title: true, 
      author: {
        select: {name: true},
      },    
    },
    
  })

  res.json(posts)
})

app.get('/feed', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true }
  })
  res.json(posts)
})

app.get('/filterPosts/:search', async (req, res) => {
  const searchString = req.params.search;
  const filteredPosts = await prisma.post.findMany({
    where: {
      OR: [
        {
          title: {
            contains: searchString,
          },
        },
        
      ],
    },
  })
  res.json(filteredPosts)
})

app.post('/post', async (req, res) => {
  const { title,  authorEmail } = req.body
  const result = await prisma.post.create({
    data: {
      title,
      published: false,
      author: { connect: { email: authorEmail } },
    },
  })
  res.json(result)
})

app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.delete({
    where: {
      id: Number(id),
    },
   
  })
  res.json(post)
})

app.get(`/user_post/:id`, async (req, res) => {
  const { id } = req.params
  const post = await prisma.user.findUnique({
    where: {
      id: Number(id),
    },
    include: { posts: {
      select: {title: true},
    } },
  })
  res.json(post)
})

app.put('/publish/:id', async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { published: true },
  })
  res.json(post)
})

app.post('/user', async (req, res) => {
  const { name, email } = req.body
  // const updatedProduct = await prisma.user.create({
  //   include: {
  //     posts:true,
  //   },
  //   data: {
  //     name: name,
  //     email: email,
  //     posts: {
  //       create: [
  //         {
  //           title: 'My first post',
  //           categories: {
  //             connectOrCreate: [
  //               {
  //                 create: { name: 'Introductions' },
  //                 where: {
  //                   name: 'Introductions'
  //                 }
  //               },
  //               {
  //                 create: { name: 'Social' },
  //                 where: {
  //                   name: 'Social'
  //                 }
  //               }
  //             ]
  //           }
  //         },
          
  //       ]
  //     }
  //   }
  // })

  // Change the author of a post in a single transaction
const updatedPost: any = await prisma.post.update({
  where: { id: 2 },
  data: {
    author: {
      connect: { id: 1 },
    },
  },
})
  res.json(updatedPost)
})



const server = app.listen(3001, () =>
  console.log(
    ' Server ready at: http://localhost:3001',
  ),
)
