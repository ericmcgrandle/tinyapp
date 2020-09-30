const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser()); 
app.set("view engine", "ejs");

//Database of shortened URL links
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Database for users
const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "test"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//Generate 'random' url / id
const generateRandomString = () => {
  let str = Math.random().toString(36).substring(7);
  return str;
};

const lookupEmail = (email) => {
  for (user in users){
    if (Object.values(users[user]).includes(email)) {
      return true;
    }
  }
  return false;
};


//app.get functions
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const id = req.cookies['user_id'];
  const templateVars = { 
    urls: urlDatabase,
    user: users[id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.cookies['user_id'];
  const templateVars = { 
    urls: urlDatabase,
    user: users[id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies['user_id'];
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]){
    console.log('Attempt at accessing a URL that does not exist');
    res.redirect('/urls')
  }

  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get(`/urls/:shortURL/update`, (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});  

app.get('/register', (req, res) => {
  const id = req.cookies['user_id'];
  const templateVars = { 
    user: users[id]
  };
  res.render("register", templateVars);
});

app.get('/login', (req, res) => {
  const id = req.cookies['user_id'];
  const templateVars = { 
    user: users[id]
  };
  res.render("login", templateVars);
});

app.get('*', (req, res) => {
  console.log('Page does not exist');
  res.redirect('/urls');
});


//app.post functions
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  let shortURL = generateRandomString();

  if (Object.values(urlDatabase).indexOf(longURL) === -1) {
    urlDatabase[shortURL] = longURL;
 } else {
    shortURL = Object.keys(urlDatabase).find(key => urlDatabase[key] === longURL);
 }

 res.redirect(`/u/${shortURL}`);

});

app.post(`/urls/:shortURL/delete`, (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post(`/urls/:shortURL/update`, (req, res) => {
  const longURL = req.body.update;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  
  //Check if user exists
  if (lookupEmail(email)){
    if (users[user].password === password){
      res.cookie('user_id', users[user].id);
      res.redirect('/urls');
      return;
    } else {
      console.log('Wrong password');
      res.statusCode = 403;
      res.redirect('/login');
      return;
    }
  }
  res.statusCode = 403;
  res.redirect('/register'); 
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {

  //If passwords did not match
  if (req.body.password !== req.body['password-repeat']) {
    //TODO, add message to html form that passwords did not match
    console.log('Passwords did not match');
    res.statusCode = 400;
    res.redirect('/register');
    return;
  }

  //if user already exists
  if (lookupEmail(req.body.email)) {
    //TODO, add message to html form that user already exists
    console.log('User already exists');
    res.statusCode = 400;
    res.redirect('/register');
    return;
  }

  //registration if all good
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userId = generateRandomString();
  res.cookie('user_id', userId);

  //add to object
  users[userId] = { id: userId, email: userEmail, password: userPassword };
  res.redirect('/urls');
});



//Listen to server on PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});