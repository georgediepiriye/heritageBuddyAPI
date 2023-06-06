const express = require("express");
const dotenv = require("dotenv");
const app = express();
const morgan = require("morgan");
var cors = require("cors");
dotenv.config();
const connectDB = require("./config/db");
connectDB();
const departmentRoutes = require("./routes/departmentRoutes");
const ministryRoutes = require("./routes/ministryRoutes");
const { verify, check } = require("./verifyOtp");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const buddiesRoutes = require("./routes/buddiesRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const seasonRoutes = require("./routes/seasonRoutes");
const submittedTaskRoutes = require("./routes/submittedTaskRoutes");
const questionRoutes = require("./routes/questionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const eventMessagesRoutes = require("./routes/eventMessagesRoutes");
const fileUpload = require("express-fileupload");
const eventRoutes = require("./routes/eventRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const askQuestionsRoutes = require("./routes/askQuestionsRoutes");
const adminMessagesRoutes = require("./routes/adminMessagesRoutes");
const firebaseTokenRoutes = require("./routes/firebaseTokenRoutes");
const cron = require("node-cron");
const Event = require("./models/eventModel");
const Birthday = require("./models/birthdayModel");
const Season = require("./models/seasonModel");
const bodyParser = require("body-parser");
const Message = require("./models/messageModel");
const User = require("./models/userModel");

//middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  next();
});
app.set("view engine", "ejs");
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
  })
);

//routes
app.use("/api/v1/department", departmentRoutes);
app.use("/api/v1/ministry", ministryRoutes);
app.post("/api/v1/verify", verify);
app.post("/api/v1/check", check);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/buddies", buddiesRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/season", seasonRoutes);
app.use("/api/v1/submit_task", submittedTaskRoutes);
app.use("/api/v1/question", questionRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/event_message", eventMessagesRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/milestone", milestoneRoutes);
app.use("/api/v1/ask_question", askQuestionsRoutes);
app.use("/api/v1/admin_message", adminMessagesRoutes);
app.use("/api/v1/send_firebase_token", firebaseTokenRoutes);

//cron job that creates birthday events everyday
cron.schedule("0 0 * * *", async function () {
  //get today's date
  const today = new Date(Date.now());
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const dayAndMonth = `${day}/${month}`;

  //get all birthdays for today
  const birthdays = await Birthday.find({ date: dayAndMonth }).populate("user");

  if (birthdays.length > 0) {
    const eventArray = [];

    //create birthday event for each birthday today
    birthdays.forEach((birthday) => {
      //get  user that have birthday today and increase age
      User.updateOne(birthday.user, {
        $set: { age: age + 1 },
      });
      console.log("creating event...");
      const event = new Event({
        image: birthday.user.pic,
        title: `Say a birthday wish to ${birthday.user.firstname}`,
        date: dayAndMonth,
        owner: birthday.user,
        type: "birthday",
      });
      eventArray.push(event);
    });
    await Event.insertMany(eventArray);

    console.log("event created..");
  } else {
    return;
  }
});

//cron job that runs at the start of every year
cron.schedule("0 0 1 1 *", async function () {
  const allUsers = await User.find();
  await User.updateMany(
    { allUsers },
    {
      $set: {
        points: 0,
      },
    }
  );
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server is currently running...");
  const today = new Date(Date.now());
  const date = today.toISOString();

  console.log(date);
});

// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "*",
//   },
// });

// io.on("connection", (socket) => {
//   console.log("connected to socket.io");
//   console.log(socket.id);

//   var userId = "";

//   socket.on("joinRoom", (data) => {
//     const room_data = JSON.parse(data);
//     userId = room_data.userId;
//     const chat = room_data.chatId;

//     socket.join(`${chat}`);

//     //broadcast when a user connects
//     socket.broadcast.to(chat).emit("message", `${userId} has joined the chat`);
//     console.log(user);
//     console.log(`this is the ${chat}`);
//   });

//   socket.on("message", (messages) => {
//     socket.emit("message", messages);
//   });

//   //listen for chat message
//   socket.on("chatMessage", ({ message, chat }) => {
//     //send message to users
//     socket.broadcast.to(chat).emit("message", message);
//   });
// });
