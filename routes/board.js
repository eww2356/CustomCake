module.exports = function(app) {
  app.get('/board', (req, res, next) => {
    res.send('게시글 가져오기')
  });

  app.post('/board', (req, res, next) => {
    res.send('게시글 쓰기')
  });

  app.put('/board/:id', (req, res, next) => {
    res.send('게시글 수정')
  });

  app.delete('/board/:id', (req, res, next) => {
    res.send('게시글 삭제')
  });
}
