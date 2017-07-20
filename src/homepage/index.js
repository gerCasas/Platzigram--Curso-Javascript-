var page = require('page');
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/', function (ctx, next) {
  title('Platzigram');
  var main = document.getElementById('main-container');

  var pictures = [
    {
      user: {
        username: 'Luis',
        avatar: 'https://lh3.googleusercontent.com/XovXLpWy6M4ggoucnWNge4hgrjAsX22_hT2WDg_hE0e-FNScEnKr8z6J479jvnhjW8_gyu6U6Y4NlMx3cg=w5120-h3200-rw-no'
      },
      url: 'http://materializecss.com/images/office.jpg',
      likes: 123,
      liked: true,
      createdAt: new Date()
    },
    {
      user: {
        username: 'German',
        avatar: 'https://lh3.googleusercontent.com/4EibVauK5UIfrNteW8hp7tBREGtnhTSxdEhmLR8j5gE-d5JlqFw1H3BXfqkVKOwzqaNbvbmpPAj1Rl-c=w5120-h3200-rw-no'
      },
      url: 'http://materializecss.com/images/sample-1.jpg',
      likes: 234,
      liked: false,
      createdAt: new Date().setDate(new Date().getDate() - 10)
    },
    {
      user: {
        username: 'Luis',
        avatar: 'https://lh3.googleusercontent.com/XovXLpWy6M4ggoucnWNge4hgrjAsX22_hT2WDg_hE0e-FNScEnKr8z6J479jvnhjW8_gyu6U6Y4NlMx3cg=w5120-h3200-rw-no'
      },
      url: 'http://materializecss.com/images/office.jpg',
      likes: 123,
      liked: true,
      createdAt: new Date()
    },
    {
      user: {
        username: 'German',
        avatar: 'https://lh3.googleusercontent.com/4EibVauK5UIfrNteW8hp7tBREGtnhTSxdEhmLR8j5gE-d5JlqFw1H3BXfqkVKOwzqaNbvbmpPAj1Rl-c=w5120-h3200-rw-no'
      },
      url: 'http://materializecss.com/images/sample-1.jpg',
      likes: 234,
      liked: false,
      createdAt: new Date().setDate(new Date().getDate() - 10)
    }
  ];

  empty(main).appendChild(template(pictures));
})
