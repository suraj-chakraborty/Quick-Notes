const mongoose = require('mongoose')
const Document = require('./Document')
mongoose.connect('mongodb://localhost/quick-notes');

const io =require('socket.io')( 8080,{
     cors:{
        origin: "http://localhost:3000",
        methods: ['GET', 'POST']
    },
 }
)

const defaultValue = ""

io.on("connection", socket => {
    socket.on('get-document',async documentId =>{
        const document = await Focd(documentId)
        socket.join(documentId)
        socket.emit("load-document", document.data)
 
  socket.on('send-changes', delta => {
    socket.broadcast.to(documentId).emit('receive-changes', delta)
  })

  socket.on("save-document", async data => {
    await Document.findByIdAndUpdate(documentId, { data })
  })
})
})
// find if the documentid exist else create a new document
async function Focd(id) {
    if (id == null) return

    const document= await Document.findById(id)
    if (document) return document
    return await Document.create({_id: id, data: defaultValue})

}
