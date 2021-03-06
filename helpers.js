const generateRandomString = () => {
  let str = Math.random().toString(36).substring(7);
  return str;
};

const lookupEmail = (email, users) => {
  for (user in users){
    if (Object.values(users[user]).includes(email)) {
      return users[user].ID;
    }
  }
  return false;
};

const lookupURL = (longURL, urlDatabase) => {
  for (short in urlDatabase) {
    if (Object.values(urlDatabase[short]).indexOf(longURL) !== -1) {
      return short;
    } 
  }
  return false;
};

const isLoggedIn = (user_ID, users) => {
  for (user in users) {
    if (user === user_ID) {
      return true;
    }
  }
  return false;
};

const filterUrl = (user_ID, urlDatabase) => {
  const filtered = Object.values(urlDatabase).filter(key => key.userID.includes(user_ID));
  const obj = {};
  
  for (url of filtered){
    const shortURL = Object.keys(urlDatabase).find(elem => urlDatabase[elem] === url);
    obj[shortURL] = url;
  }
  return obj;
};

const getTime = () => {
  const date = new Date();
  const day = date.toDateString();
  const time = date.toLocaleTimeString();
  return (day + " : " + time);
};

module.exports = ({ 
  generateRandomString, 
  lookupEmail, 
  lookupURL, 
  isLoggedIn,
  filterUrl,
  getTime
});