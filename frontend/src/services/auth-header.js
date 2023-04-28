export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  // original: accessToken
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
}