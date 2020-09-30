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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  y54fge: { longURL: "https://www.lighthouselabs.ca", userID: "user2RandomID" }
};

//Database for users
const users = {
  "userRandomID": {
    ID: "userRandomID", 
    email: "user@example.com", 
    password: "user"
  },
 "user2RandomID": {
    ID: "user2RandomID", 
    email: "user2@example.com", 
    password: "user2"
  }
};

//Generate 'random' url / ID
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

const lookupURL = (longURL) => {
  for (short in urlDatabase) {
    if (Object.values(urlDatabase[short]).indexOf(longURL) !== -1) {
      return short;
    } 
  }
  return false;
};

const isLoggedIn = (user_ID) => {
  for (user in users) {
    if (user === user_ID) {
      return true;
    }
  }
  return false;
};

const filterUrl = (user_ID) => {
  const filtered = Object.values(urlDatabase).filter(key => key.userID === user_ID);
  const obj = {};
  
  for (url of filtered){
    const shortURL = Object.keys(urlDatabase).find(elem => urlDatabase[elem] === url);
    obj[shortURL] = url;
  }
    
  return obj;
};


//app.get functions
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {

  const ID = req.cookies['user_ID'];

  if (!isLoggedIn(ID)) {
    templateVars = {
      urls: null,
      user: null 
    };
    res.render('urls_index', templateVars);
  } else {

  const filteredURLS = filterUrl(ID);
  const templateVars = { 
    urls: filteredURLS,
    user: users[ID]
  };
  res.render("urls_index", templateVars);
}

});

app.get("/urls/new", (req, res) => {

  if (!req.cookies['user_ID']){
    res.redirect('/login');
    return;
  }

  const ID = req.cookies['user_ID'];
  const templateVars = { 
    urls: urlDatabase,
    user: users[ID]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {

  const ID = req.cookies['user_ID'];
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
  const ID = req.cookies['user_ID'];
  const templateVars = { 
    user: users[ID]
  };
  res.render("register", templateVars);
});

app.get('/login', (req, res) => {
  const ID = req.cookies['user_ID'];
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
  const ID = req.cookies['user_ID'];
  console.log(ID);
  const longURL = req.body.longURL;
  let shortURL = generateRandomString();

  //Check if longURL already exists
  const exists = lookupURL(longURL);

  if (!exists) {
    urlDatabase[shortURL] = { longURL: longURL, userId: ID };
  } else {
    shortURL = exists;
  }

  res.redirect(`/u/${shortURL}`);
  res.redirect('/urls');

});

app.post(`/urls/:shortURL/delete`, (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post(`/urls/:shortURL/update`, (req, res) => {
  const ID = req.cookies['user_ID'];
  const longURL = req.body.update;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = { longURL: longURL, userId: ID };
  res.redirect('/urls');
});

app.post('/login', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  
  //Check if user exists
  if (lookupEmail(email)){
    if (users[user].password === password){
      res.cookie('user_ID', users[user].ID);
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
  res.clearCookie('user_ID');
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
  res.cookie('user_ID', userId);

  //add to object
  users[userId] = { ID: userId, email: userEmail, password: userPassword };
  res.redirect('/urls');
});



//Listen to server on PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});