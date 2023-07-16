const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const fs = require("fs");

const usersDataFile = "./users.json";

app.use(express.urlencoded({ extended: true }));

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.set("view engine", "ejs");

// Register route
app.get("/register", (req, res) => {
  res.render("register.ejs", { error: null });
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.render("register.ejs", {
        error: "Please enter all fields.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
    };

    const usersData = JSON.parse(fs.readFileSync(usersDataFile));
    usersData.push(user);

    fs.writeFileSync(usersDataFile, JSON.stringify(usersData));

    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.redirect("/register");
  }
});

// Login route
app.get("/login", (req, res) => {
  res.render("login.ejs", { error: null });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("login.ejs", {
        error: "Please enter email and password.",
      });
    }

    const usersData = JSON.parse(fs.readFileSync(usersDataFile));

    const user = usersData.find((u) => u.email === email);
    if (!user) {
      return res.render("login.ejs", {
        error: "User not found. Please register.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.render("login.ejs", {
        error: "Invalid password. Please try again.",
      });
    }

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/login");
  }
});