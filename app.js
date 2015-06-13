(function(){
    'use strict';

    // monaca ideでプレビューする場合はhttps必須（オレオレ証明書可）
    // 実機で実行する場合はオレオレ証明書不可のためhttpで
    var API_ROOT = 'https://ciao-testtesttest.ssl-lolipop.jp/club86cake/api';
    //var API_ROOT = './json';
    var selectedId = null;
    var cart = [];

    window.clickRegister = function() {
        var username = $('.username', '#register-page').val();
        var password = $('.password', '#register-page').val();
        var name = $('.name', '#register-page').val();
        $.ajax({
            type: 'POST',
            url: API_ROOT + '/users.json',
            data: {username: username, password: password, name: name},
            success: function(data, dataType) {
                ons.notification.alert({message: data.message});
                app.navi.popPage();
            },
            error: function(xhr, status, thrown) {
                ons.notification.alert({message: data.message});
            }
        });
    };

    window.clickLogin = function() {
        var username = $('.username', '#login-page').val();
        var password = $('.password', '#login-page').val();
        $.ajax({
            type: 'POST',
            url: API_ROOT + '/users/login.json',
            data: {username: username, password: password},
            success: function(data, dataType) {
                // userが入っていればログイン出来たとみなす
                if (data.user) {
                    app.navi.pushPage('list.html');
                } else {
                    ons.notification.alert({message: data.message});
                }
            },
            error: function(xhr, status, thrown) {
            }
        });
    };

    $(document).on('pageinit', '#list-page', function() {
        // 場所条件リスト
        var arealists = new Array();
        arealists.push({key:0, value:"指定なし"});
        arealists.push( { key:1, value:"半径200m以内" } );
        arealists.push( { key:2, value:"半径200m以上〜500m未満"} );
        arealists.push( { key:3, value:"半径500m以上"} );

        // 評価条件リスト
        var evaluatelists = [
            {key:0, value:"指定なし"},
            {key:1, value:"★"},
            {key:2, value:"★★"},
            {key:3, value:"★★★"},
            {key:4, value:"★★★★"},
            {key:5, value:"★★★★★"}
        ];

        // 値段条件リスト
        var pricelists = [
            {key:0, value:'指定なし'},
            {key:1, value:'400円未満'},
            {key:2, value:'400円以上〜600円未満'},
            {key:3, value:'600円以上'}
        ];

        $('#life-list').empty();

        $.ajax({
            type: 'GET',
            url: API_ROOT + '/lives.json',
            dataType: 'json',
            /*
            xhrFields: {
            withCredentials: true
            },
            */
            success: function(data) {
                $.each(data.lives, function(i, life) {
                    var html = '<ons-list-item modifier="chevron" class="life" onclick="clickLife(' + life.Life.id +  ')"><ons-row>';
                    //html += '<ons-col width="60px"><div class="life-thum"><img src="' + life.Life.image  + '" width="50" height="50"></div></ons-col>';
                    html += '<ons-col><header><span class="life-name">' + life.Life.name + '</span></header>';
                    // html += '<p class="life-where">' + arealists["0"] + '</p>';
                    html += '<p class="life-where">' + arealists[life.Life.where].value + '</p>';
                    html += '<p class="life-price">' + pricelists[life.Life.price].value + '</p>';        　
                    html += '<p class="life-searchcategory-name">' + life.Searchcategory.name + '</p>';
                    html += '<p class="life-emotionalcategory-name">' + life.Emotionalcategory.name + '</p>';
                    html += '</ons-col></ons-row></ons-list-item>';
                    $('#life-list').append(html);
                });
            ons.compile($('#life-list')[0]);
            }
        });
    });

  window.clickLife = function(id) {
    selectedId = id;
    app.navi.pushPage('detail.html');
  };

  $(document).on('pageinit', '#detail-page', function() {
    $.ajax({
      type: 'GET',
      url: API_ROOT + '/lives/' + selectedId + '.json',
/*
      xhrFields: {
        withCredentials: true
      },
*/
      success: function(data) {
        var img = new Image(280, 280);
        img.src = data.life.Life.image;
        $('.life-image', '#detail-page').empty().append(img);
        $('.life-name', '#detail-page').text(data.life.Life.name);
        $('.life-category-name', '#detail-page').text(data.life.Category.name);
        $('.life-price', '#detail-page').text(data.life.Life.price + '円');
        $('.comment-post', '#detail-page').on('click', function() {
          var message = $('.comment-message', '#detail-page').val();
          var rank = $('input[name=comment-rank]:checked', '#detail-page').val();
          if ('' == message) {
            ons.notification.alert({message: "メッセージを入力してください"});
            return;
          }
          if (!rank) {
            ons.notification.alert({message: "評価を選択してください"});
            return;
          }
          window.clickCommentPost(data.life.Life.id, message, rank);
        });
      }
    });
    displayComment(selectedId);
  });

  window.displayComment = function(lifeId) {
    $('#life-comments').empty();
    $.ajax({
      type: 'GET',
      url: API_ROOT + '/lives/' + lifeId + '/comments.json',
      success: function(data) {
        $.each(data.comments, function(i, comment) {
          var rank = '';
          if (5 == parseInt(comment.Comment.rank, 10)) {
            rank = '★★★★★';
          } else if (4 == parseInt(comment.Comment.rank, 10)) {
            rank = '★★★★';
          } else if (3 == parseInt(comment.Comment.rank, 10)) {
            rank = '★★★';
          } else if (2 == parseInt(comment.Comment.rank, 10)) {
            rank = '★★';
          } else if (1 == parseInt(comment.Comment.rank, 10)) {
            rank = '★';
          }
          var html = '<ons-list-header><ons-row>';
          html += '<ons-col>' + rank + '</ons-col>';
          html += '<ons-col>' + comment.Comment.created + '</ons-col>';
          html += '</ons-row></ons-list-header>';
          html += '<ons-list-item class="life-comment">' + comment.Comment.message + '</ons-list-item>';
          $('#life-comments').append(html);
        });
        ons.compile($('#life-comments')[0]);
      }
    });
  };

  window.clickCommentPost = function(lifeId, message, rank) {
    $.ajax({
      type: 'POST',
      url: API_ROOT + '/life/' + lifeId + '/comments.json',
      data: {rank: parseInt(rank, 10), message: message},
      success: function(data) {
        if ('OK' == data.message) {
          displayComment(lifeId);
          $('.comment-message', '#detail-page').val('');
          $('input[name=comment-rank]', '#detail-page').val(['3']);
        } else {
          ons.notification.alert({message: "コメントの投稿に失敗しました"});
        }
      }
    });
  };

})();
