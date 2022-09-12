
/*
    * 1. Render song
    * 2. Scroll top
    * 3. Play / pause / seek
    * 4. CD rotate
    * 5. Next / prev
    * 6. Random
    * 7. Next / Repeat when ended
    * 8. Active song
    * 9. Scroll active song into view
    * 10. play song when click
 */

const $ =document.querySelector.bind(document)
const $$ =document.querySelectorAll.bind(document)

const PlAYER_STORAGE_KEY = "NK_PLAYER";

const cd = $('.cd')
const heading= $('header h2')
const cdThumb= $('.cd-thumb')
const audio= $('#audio')
const playBtn=$('.btn-toggle-play')
const player = $(".player");
const progress= $('#progress')
const preBtn=$('.btn-prev')
const nextBtn=$('.btn-next')
const randomBtn=$('.btn-random')
const repeatBtn=$('.btn-repeat')
const playlist= $('.playlist')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name:'Faded',
            singer:'Alan Walker',
            path: './assets/music/Song-1-Faded-AlanWalker.mp3',
            image:'./assets/img/song1.jpg'
        },
        {
            name:'Cheating On You',
            singer:'Charlie Puth',
            path: './assets/music/Song-2-CheatingOnYou-CharliePuth.mp3',
            image:'./assets/img/song2.jpg'
        },
        {
            name:'Love yourself',
            singer:'Justin Bieber',
            path: './assets/music/Song-3-LoveYourself-JustinBieber.mp3',
            image:'./assets/img/song3.jpg'
        },
        {
            name:'Mặt Mộc',
            singer:'Phạm Nguyên Ngọc',
            path: './assets/music/Song-4-MatMoc-PhamNguyenNgocVanh.mp3',
            image:'./assets/img/song4.jpg'
        },
        {
            name:'vaicaunoicokhiennguoithaydoi',
            singer:'Grey-D',
            path: './assets/music/Song-5-vaicaunoicokhiennguoithaydoi - GREY D tlinh.mp3',
            image:'./assets/img/song5.jpg'
        },
        {
            name:'Bên trên tầng lầu',
            singer:'Tăng Duy Tân',
            path: './assets/music/Song-6-BenTrenTangLau-TangDuyTan.mp3',
            image:'./assets/img/song6.jpg'
        },
        {
            name:'Cưới thôi',
            singer:'Masew',
            path: './assets/music/Song-7-CuoiThoi-MasiuMasew.mp3',
            image:'./assets/img/song7.jpg'
        },
        {
            name:'Nevada',
            singer:'Vicetone',
            path: './assets/music/Song-8-Nevada-Monstercat.mp3',
            image:'./assets/img/song8.jpg'
        },
        {
            name:'Payphone',
            singer:'ALex G',
            path: './assets/music/Song-9-Payphone.mp3',
            image:'./assets/img/song9.jpg'
        },
    ],

    setConfig: function(key,value){
        this.config[key]= value
            localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function(){
        const htmls = this.songs.map((song, index) => {
            return /*html*/`
                <div class="song ${index===this.currentIndex ? "active": ""}" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>  
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            ` 
        })
        playlist.innerHTML=htmls.join('')
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function(){
        const _this=this
        // Xử lí phóng to thu nhỏ
        const cdWidth= cd.offsetWidth

        document.onscroll= function(){
            const scrollTop= window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop 

            cd.style.width= newCdWidth > 0 ? newCdWidth + "px" : 0
            cd.style.opacity= newCdWidth/ cdWidth
        }

        // Xử lí CD quay/ dừng
        const cdThumbAnimate= cdThumb.animate([
            // animate api
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
            // infinity làm cho cd quay tuần hoàn
            // duration: quay 1 vòng trong 10s
        })  
        cdThumbAnimate.pause()
        // khi chưa chạy thì ở trạng thái dừng


        // Xử lí khi click play
        playBtn.onclick= function(){
            if(_this.isPlaying){
                audio.pause()
                // Khi đang chạy click vào  dừng
            }else {
                audio.play()
                // Khi đang dừng click vào  chạy
            }

        }
        audio.onplay=function(){
            _this.isPlaying= true
            player.classList.add('playing')
            // chuyển trạng thái khi chạy sang nút pause

            cdThumbAnimate.play()
            // khi chạy thì cd sẽ quay
        }

        audio.onpause= function(){
            _this.isPlaying= false
            player.classList.remove('playing')
            // chuyển trạng thái khi dừng sang nút play

            cdThumbAnimate.pause()
            // khi dừng thì cd sẽ dừng
        }

        // khi tiến độ bài hát thay đổi 
        audio.ontimeupdate= function(){
            if(audio.duration){
                const progressPercent= Math.floor((audio.currentTime/audio.duration) * 100)
                // currentTime: Thòi gian hiện tại khi chạy bài hát
                // duration: thời lượng của bài hát
                progress.value=progressPercent
            }   
        }

        // Xử lí khi tua bài hát

        //?? Fix lỗi khi tua và giữ vì event updatetime nó liên tục dẫn tới lỗi
        progress.onchange = function(e){
            const seekTime=e.target.value * audio.duration/100
            audio.currentTime= seekTime                                                       
        }


        // Khi next bài hát
        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else {
                _this.nextSong()
            }
            // kiểm tra click vào btn random chưa nếu đã click thì thực hiện next và random
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi pre bài hát
        preBtn.onclick =function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else {
                _this.prevSong()
            }
            // kiểm tra click vào btn random chưa nếu đã click thì thực hiện pre và random
            audio.play()
            _this.render()
            _this.scrollToActiveSong()

        }
        // bật tắt nút random bài hát
        randomBtn.onclick =function(){
            _this.isRandom= !_this.isRandom
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle('active',_this.isRandom)
            // toggle : hiển thị và ẩn đi class active
        }
        // bật tắt nút repeat
        repeatBtn.onclick = function(){
            _this.isRepeat= !_this.isRepeat
            _this.setConfig("isRepeat", _this.isRepeat);

            repeatBtn.classList.toggle('active',_this.isRepeat)
        }
        // khi hết bài sẽ repeat lại bài đó nếu không thì next sang bài khác
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }else {
                nextBtn.click()
            }
        }
        // click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");
      
            if (songNode || e.target.closest(".option")) {
              // Xử lý khi click vào song
              // Handle when clicking on the song
              if (songNode) {
                _this.currentIndex = Number(songNode.dataset.index);
                _this.loadCurrentSong();
                _this.render();
                audio.play();
              }
      
              // Xử lý khi click vào song option
              // Handle when clicking on the song option
              if (e.target.closest(".option")) {
              }
            }
        }
    },
 
 

    loadCurrentSong: function(){
        heading.textContent= this.currentSong.name
        cdThumb.style.backgroundImage=`url('${this.currentSong.image}')`
        audio.src= this.currentSong.path

    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
      },

   
    // Xử lí khi next và next hết bài hát thì quay về bài hát đầu tiên
    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    // Xử lí khi pre và nếu ở bài hát đầu tiên pre đến bài hát cuối cùng
    prevSong: function(){
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length-1
        }
        this.loadCurrentSong()
    },
    
    // Xử lí random bài hát
     playRandomSong: function(){
        let newIndex
        do {
            newIndex= Math.floor(Math.random() * this.songs.length)
        }while(newIndex === this.currentIndex)

        this.currentIndex=newIndex
        this.loadCurrentSong()
     },

     scrollToActiveSong: function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            })
        }, 300)
     },
    
    
    
    start: function(){
        // Gán cấu hình config vào ứng dụng
        this.loadConfig()
        
        // Định nghĩa thuộc tính cho object
        this.defineProperties()

        // Xử lí sự kiện
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào giao diện khi chạy
        this.loadCurrentSong()
        
        // Render playlist
        this.render()

        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);

    }
}

app.start()