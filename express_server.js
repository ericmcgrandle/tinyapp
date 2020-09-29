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

//Listen to server on PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Generate 'random' url
const generateRandomString = () => {
  let str = Math.random().toString(36).substring(7);
  return str;
};


//app.get functions
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
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
  res.render("register");
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
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});







