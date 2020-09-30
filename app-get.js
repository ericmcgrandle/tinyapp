module.exports = function(app) {

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

}