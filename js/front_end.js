(function($) {

    //========== 變數區 ==========
    //拿去餐廳的情況來描述
    var data = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8] //以陣列來表示對應的卡牌 = 排著隊，但有跟著妳的朋友一起排
    var open = null //沒有卡牌 = 比較衰的人，可能傻傻站很久還沒拿到牌
    var set_time,
        num = 120,
        num_js = num
    var $flipCard = $('.flipCard_page'),
        $p_num = $('.fliptime .num'),
        $fail_modal = $('.flipCard_fail_modal'),
        $correct_modal = $('.flipCard_correct_modal'),
        isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    // console.log(data)

    //========== 函式庫 ==========
    //---點擊事件函式
    function flipCard() {
        var index = $(this).index() //目前卡牌編號 = 要怎麼知道現在是誰做？就像你提早到餐廳，餐廳會先發一張卡讓你等候(數字卡)
        var select = data[index] //用卡牌編號拿取陣列相對應的編號的內容 = 
            // console.log(open)

        if (!open) { //如果有卡牌打開 null的相反 == true 這裡只是表示是true就做
            open = select //將編號的內容放入open
                // console.log(open)
            handler = openedHandler //給予function
        } else { //如果沒有卡牌打開 is null
            handler = checkHandler //給予function
        }
        $('.card').off('click touch') //關閉所有卡牌點擊
            .eq(index).one('transitionend', handler) //選定fn打開牌點擊
            .children('.back').css({ backgroundImage: 'url("./images/button/' + select + '.png")' }) //換好圖
            .parent().addClass('open') //再翻牌
        flip_modal()
    }
    //---除了特有名稱的人不打開外要給其他人可以點擊事件
    function openedHandler() {
        // console.log("openedHandler")
        $('.card').not('.open').one('click touch', flipCard)
    }

    function checkHandler() {
        // console.log('checkHandler')
        var index = $(this).index() //現在的排列序號
        var select = data[index]
        if (select != open) {
            $('.card').removeClass('open')
        }
        open = null //再重置一次就會做if(!open)第一個
        openedHandler()
    }
    //---打亂data陣列的順序
    function sort() {
        if (isSafari) { //why? A:https://www.cnblogs.com/fayin/p/9023342.html
            data.sort((a, b) => Math.random(b) - Math.random(a))
            return false;
        }
        // data.sort(function(a, b) { // 最小到最大
        //     return Math.round(Math.random()) // 打亂順序 = 排著隊，但妳的朋友可能去方便洗手間之類而被擠到後面一起排
        // })
        data.sort((a, b) => Math.random(b) - Math.random(a))
    }
    //---全對獎勵函式
    function flip_modal() {
        if ($('.card.open').length == data.length) {
            flip_cleartime()
            $flipCard.addClass('in')
            $correct_modal.find('.modal-title').text('恭喜您獲得“輕井澤”一卷')
            $correct_modal.find('button').text('再玩一次')
            $correct_modal.modal({
                    backdrop: 'static',
                    show: 'true'
                })
                //---防止小人放入這裡不被掀開起成功
            $correct_modal.one('click touch', 'button', reset)
        }
    }
    //---重置
    function reset() {
        //---防止小人放入這裡不被掀開起成功
        $correct_modal.off('click touch', 'button', reset)
        $fail_modal.off('click touch', 'button', reset)
            // 重置開始
        $flipCard.removeClass('in')
        $('.flipCard').removeClass('in') // modal進場動畫
            .children().removeClass('open').one('click touch', flipCard) // 給予點擊功能
        sort() // 打亂
        flip_time() // 開啟計時器
    }
    //---計時器，倒數計時(時間到做失敗modal，並關閉計時器與重設倒數數字)
    function flip_time() {
        $p_num.text(num)
        set_time = setInterval(function() {
            num--
            // console.log(num)
            $p_num.text(num)
                //倒數變色
            if (num == 60) $p_num.css({ 'color': '#f00' })
            if (num == 0) {
                function fn_1() {
                    return new Promise((resolve, reject) => {
                        $('.card').off('click touch')
                        open = null
                        flip_cleartime()
                            // console.log('fn_1:OK')
                        resolve(fn_2)
                    })
                }

                function fn_2() {
                    $flipCard.addClass('in')
                    $fail_modal.find('button').text('再試一次')
                    $fail_modal.modal({
                            backdrop: 'static',
                            show: 'true'
                        })
                        //---防止小人放入這裡不被掀開起失敗
                    $fail_modal.one('click touch', 'button', reset)
                        // console.log('fn_2:OK')
                }
                fn_1().then(fn_2) //防止modal出來時剛好打開open的值還保留在
            }
        }, 1000)
    }
    //---計時器關閉與重設
    function flip_cleartime() {
        clearInterval(set_time)
        $p_num.attr('style', '')
        num = num_js
    }

    //---小人專屬
    function bitch() {
        alert('遊戲未開始')
        $('.bitch_modal').modal('show')
    }

    //========== 事件綁定 ==========

    //---全對與全錯獎勵事件(成功)(失敗) === 防小人，已挪走
    // $correct_modal.on('click touch','button',reset)
    // $fail_modal.on('click touch','button',reset)

    //---卡牌點擊 === 防小人，已挪走
    // $('.card').one('click touch',flipCard)

    //---小人專屬開啟
    $('.card').on('click touch', bitch)

    //---開始
    $('.flipCard_start_modal .start').on('click touch', function() {
        // 小人專屬關閉
        $('.card').off('click touch', bitch)
            // 遊戲開始
        flip_time()
        sort()
            // 卡牌點擊
        $('.card').one('click touch', flipCard)
    })

    //========== 先行 ==========
    $('.flipCard_start_modal').modal({
            backdrop: 'static',
            show: 'true'
        })
        // $('.flipCard_correct_modal').modal('show')


})(jQuery)