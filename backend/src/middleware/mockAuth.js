// Temporary middleware to mock a logged-in user
module.exports = (req, res, next) => {
  // Hardcode a real MongoDB ObjectId from your local DB seed
  const mockUserId = req.headers['x-mock-user-id'] || '660a123456789abcdef01234';

  req.user = {
    id: '6a6ad0314b076fc35220c1f8',
    role: 'admin'
  };

  next();
};