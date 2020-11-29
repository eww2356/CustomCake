module.exports = function(app) {
  app.get('/order2', (req, res) => {
    res.render('order2.ejs');
  });
}