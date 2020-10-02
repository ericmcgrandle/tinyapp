//require
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const helpers = require('./helpers');
const methodOverride = require('method-override');

//app.use
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ['invisiblekey', 'youdontseeme']
}));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
const PORT = 8080;


//Database of URL links
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: ["userRandomID"], date: 'Thu Sept 27 2020 : 4:33:42 PM', count: 0 },
  i3BoGr: { longURL: "https://www.google.ca", userID: ["user2RandomID", "userRandomID"], date: 'Thu Oct 01 2020 : 7:58:53 PM', count: 0 },
  y54fge: { longURL: "https://www.lighthouselabs.ca", userID: ["user2RandomID"], date: 'Thu Sept 29 2020 : 3:24:86 PM', count: 0 }
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

//Analytics DB and function
const analytics = {

};

const track = (ID, url) => {
  const date = helpers.getTime();
  analytics[date] = {Id: ID, URL: url};
  return;
};

/*
=================
app.get functions
=================
*/

app.get("/", (req, res) => {
  const ID = req.session.user_id;
  track(ID, '/');

  if (helpers.isLoggedIn(ID, users)) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  const ID = req.session.user_id;

  if (!helpers.isLoggedIn(ID, users)) {
    const templateVars = {
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
    track(ID, '/urls');
    res.render("urls_index", templateVars);
  }
});

app.get('/login', (req, res) => {
  const ID = req.session.user_id;
  track(ID, '/login');

  if (helpers.isLoggedIn(ID, users)) {
    res.redirect('/urls');
  }

  const templateVars = {
    user: users[ID],
    msg: ''
  };
  res.render("login", templateVars);
});

app.get("/urls/new", (req, res) => {
  
  if (!req.session.user_id) {
    track('guest', '/urls/new');
    res.redirect('/login');
    return;
  }

  const ID = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: users[ID]
  };
  track(ID, '/urls/new');
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const ID = req.session.user_id;
  track(ID, '/urls/:shortURL');
  const shortURL = req.params.shortURL;

  //if shortURL does not exist in DB
  if (!urlDatabase[shortURL]) {
    res.statusCode = 405;
    const templateVars = {
      statusCode: 405,
      msg: "trying to accessing a URL that does not exist"
    };
    res.render('error', templateVars);
    return;
  }

  //Check if user is logged in
  if (!helpers.isLoggedIn(ID, users)) {
    res.statusCode = 405;
    const templateVars = {
      statusCode: 405,
      msg: "attempting to access something when you weren't logged in!"
    };
    res.render('error', templateVars);
    return;
  }

  //Check if user owns shortURL
  if (!urlDatabase[shortURL].userID.includes(ID)) {
    res.statusCode = 405;
    const templateVars = {
      statusCode: 405,
      msg: "trying to accessing a URL that you haven't made"
    };
    res.render('error', templateVars);
    return;
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[ID]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const count = urlDatabase[shortURL].count++;
  
  //if shortURL does not exist in DB
  if (!urlDatabase[shortURL]) {
    const templateVars = {
      statusCode: 405,
      msg: "attempting to access a URL that doesn't exist!"
    };
    res.render('error', templateVars);
    return;
  }

  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get(`/urls/:shortURL/update`, (req, res) => {
  track(req.session.user_id, '/urls/:shortURL/update');
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/register', (req, res) => {
  const ID = req.session.user_id;
  track(ID, '/register');

  if (helpers.isLoggedIn(ID, users)) {
    res.redirect('/urls');
  }
  
  const templateVars = {
    user: users[ID],
    msg: ''
  };
  res.render("register", templateVars);
});

app.get('/analytics', (req, res) => {
  const templateVars = { 
    analytics
  };
  res.render('analytics', templateVars);
});

// app.get('*', (req, res) => {
//   console.log('Page does not exist');
//   res.redirect('/urls');
// });



/*
==================
app.post functions
==================
*/
app.post("/urls", (req, res) => {
  const ID = req.session.user_id;
  const longURL = req.body.longURL;
  let shortURL = helpers.generateRandomString();
  const date = helpers.getTime();

  //Check if longURL already exists
  const exists = helpers.lookupURL(longURL, urlDatabase);

  if (!exists) {
    urlDatabase[shortURL] = { longURL: longURL, userID: [ID], date: date, count: 0 };
  } else {
    if (!urlDatabase[exists].userID.includes(users[ID].ID)) {
      urlDatabase[exists].userID.push(users[ID].ID);
    }
    shortURL = exists;
  }

  res.redirect(`/urls/${shortURL}`);

});

app.post('/login', (req, res) => {

  const ID = req.session.user_id;
  const email = req.body.email;
  const password = req.body.password;
  
  //Check if user exists
  if (helpers.lookupEmail(email, users)) {
    //Validate password
    if (bcrypt.compareSync(password, users[user].password)) {
      req.session.user_id = users[user].ID;
      res.redirect('/urls');
      return;
    } else {
      res.statusCode = 403;
      const templateVars = {
        user: users[ID],
        msg: 'Wrong Email / Password'
      };
      res.render('login', templateVars);
      return;
    }
  }
  //If user does not exist
  res.statusCode = 403;
  const templateVars = {
    user: users[ID],
    msg: 'Wrong Email / Password'
  };
  res.render('login', templateVars);
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const ID = req.session.user_id;

  //If passwords did not match
  if (req.body.password !== req.body['password-repeat']) {
    res.statusCode = 400;
    const templateVars = {
      user: users[ID],
      msg: 'Passwords did not match'
    };
    res.render('register', templateVars);
    return;
  }

  //if user already exists
  if (helpers.lookupEmail(req.body.email, users)) {
    res.statusCode = 400;
    const templateVars = {
      user: users[ID],
      msg: 'Email already exists'
    };
    res.render('register', templateVars);
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


app.delete(`/urls/:shortURL/delete`, (req, res) => {
  //Check if user is logged in
  const ID = req.session.user_id;
  if (!helpers.isLoggedIn(ID, users)) {
    res.statusCode = 405;
    console.log('Tried to delete when not logged in!');
    res.end();
    return;
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.put(`/urls/:shortURL/update`, (req, res) => {
  //Check if user is logged in
  const ID = req.session.user_id;
  if (!helpers.isLoggedIn(ID, users)) {
    res.statusCode = 405;
    console.log('Tried to delete when not logged in!');
    res.end();
    return;
  }

  const date = helpers.getTime();
  const longURL = req.body.update;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: ID, date: date, count: 0};
  res.redirect('/urls');
});



//Listen to server on PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


module.exports = { analytics };