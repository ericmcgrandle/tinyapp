//require
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const helpers = require('./helpers');


//app.use
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ['key1']
}));
app.set("view engine", "ejs");



//Database of shortened URL links
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  y54fge: { longURL: "https://www.lighthouselabs.ca", userID: "user2RandomID" }
};

//Passwords for example users
const p1 = 'user';
const hp1 = bcrypt.hashSync(p1, 10);
const p2 = 'user2';
const hp2 = bcrypt.hashSync(p2, 10);


//Database for users
const users = {
  "userRandomID": {
    ID: "userRandomID", 
    email: "user@example.com", 
    password: hp1
  },
 "user2RandomID": {
    ID: "user2RandomID", 
    email: "user2@example.com", 
    password: hp2
  }
};


//app.get functions
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {

  const ID = req.session.user_id;

  if (!helpers.isLoggedIn(ID, users)) {
    templateVars = {
      urls: null,
      user: null 
    };
    res.render('urls_index', templateVars);
  } else {
    const filteredURLS = helpers.filterUrl(ID, urlDatabase);
    const templateVars = { 
      urls: filteredURLS,
      user: users[ID]
    };
    res.render("urls_index", templateVars);
  }

});

app.get("/urls/new", (req, res) => {

  if (!req.session.user_id){
    res.redirect('/login');
    return;
  }

  const ID = req.session.user_id;
  const templateVars = { 
    urls: urlDatabase,
    user: users[ID]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {

  const ID = req.session.user_id;
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[ID]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  
  if (!urlDatabase[shortURL]){
    console.log('Attempt at accessing a URL that does not exist');
    res.redirect('/urls')
  }

  const longURL = urlDatabase[shortURL].longURL;  
  res.redirect(longURL);
});

app.get(`/urls/:shortURL/update`, (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});  

app.get('/register', (req, res) => {
  const ID = req.session.user_id;
  const templateVars = { 
    user: users[ID]
  };
  res.render("register", templateVars);
});

app.get('/login', (req, res) => {
  const ID = req.session.user_id;
  const templateVars = { 
    user: users[ID]
  };
  res.render("login", templateVars);
});

app.get('*', (req, res) => {
  console.log('Page does not exist');
  res.redirect('/urls');
});


//app.post functions
app.post("/urls", (req, res) => {
  const ID = req.session.user_id;
  const longURL = req.body.longURL;
  let shortURL = helpers.generateRandomString();

  //Check if longURL already exists
  const exists = helpers.lookupURL(longURL, urlDatabase);

  if (!exists) {
    urlDatabase[shortURL] = { longURL: longURL, userID: ID };
  } else {
    shortURL = exists;
  }

  // res.redirect(`/u/${shortURL}`);
  res.redirect('/urls');

});

app.post(`/urls/:shortURL/delete`, (req, res) => {
  //Check if user is logged in
  const ID = req.session.user_id;
  if (!helpers.isLoggedIn(ID, users)) {
    response.statusCode = 405;
    console.log('Tried to delete when not logged in!');
    res.end();
    return;
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post(`/urls/:shortURL/update`, (req, res) => {
  //Check if user is logged in
  const ID = req.session.user_id;
  if (!helpers.isLoggedIn(ID, users)) {
    response.statusCode = 405;
    console.log('Tried to delete when not logged in!');
    res.end();
    return;
  }

  const longURL = req.body.update;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: ID };
  res.redirect('/urls');
});

app.post('/login', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;  
  
  //Check if user exists
  if (helpers.lookupEmail(email, users)){
    if (bcrypt.compareSync(password, users[user].password)) {
      req.session.user_id = users[user].ID;
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
  req.session = null;
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
  if (helpers.lookupEmail(req.body.email, users)) {
    //TODO, add message to html form that user already exists
    console.log('User already exists');
    res.statusCode = 400;
    res.redirect('/register');
    return;
  }

  //registration if all good
  const userEmail = req.body.email;
  const userPassword = bcrypt.hashSync(req.body.password, 10);
  const userID = helpers.generateRandomString();
  req.session.user_id = userID;

  //add to object
  users[userID] = { ID: userID, email: userEmail, password: userPassword };
  res.redirect('/urls');
});



//Listen to server on PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});