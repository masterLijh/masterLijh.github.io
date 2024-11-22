//Model用于记录程序的数据和运行状态
    let Model = { 
        timerBegin : new Date() ,
        numOfLearning : 30,
        learning : [] ,
        learned : []
    } ;
        
        Model.CET6 = [] ;
 {//局部代码，用于处理单词数据，处理完成的单词对象数据放在Model.CET6数组中
    //createCET6可以在局部代码中，为Model.CET6增加单词对象，入口参数s是单词组成字符串
    let createCET6 = function(s){
        let cetArr = s.split('\r\n') ;
     for(let i=0;i<cetArr.length;i++){
        let wordArr = cetArr[i].split('\t');
        let obj = {} ;
          obj.en = wordArr[0] ;
          obj.pn = wordArr[1] ;
          obj.cn = wordArr[2] ;
          let enlength = obj.en.length ;
          if(enlength > 1 && enlength < 5){
            obj.level = 1 ;
          }else{
            if(enlength < 8 ){
                obj.level = 2 ;
            }else{
                obj.level = 3 ;
            }
          }
          Model.CET6.push(obj) ;
      }
    }//createCET结束
//为了让慢速网络环境能够迅速响应用户的操作，我们先在代码中存放3个单词
   let cet6String = "a	/ei/	art.一(个);每一(个);(同类事物中)任一个\r\nabandon	/ə'bændən/	vt.离弃,丢弃;遗弃,抛弃;放弃\r\nabdomen	/æb'dəumen/	n.腹,下腹(胸部到腿部的部分)" ;
    createCET6(cet6String) ;
//远程异步读取三个大型单词文本
    fetch('cet/cet1.txt') //读取cet/cet1.txt
    .then(resp => resp.text())
    .then(txt => {
        Model.CET6 = [] ;
        createCET6(txt) ;
        UI.footerLog('系统成功读取了'+ Model.CET6.length +'个单词！') ;
    }) ;
    setTimeout(function(){ //读取cet/cet2.txt
        fetch('cet/cet2.txt') //读取cet/cet2.txt
        .then(resp => resp.text())
        .then(txt => {
         createCET6(txt) ;
        UI.footerLog('系统成功读取了'+ Model.CET6.length +'个单词！') ;
    }) ;
    } , 2 * 1000); 
    setTimeout(function(){
        fetch('cet/cet3.txt')
        .then(res => res.text())
        .then(txt => {
            createCET6(txt) ;
            UI.footerLog('系统最后成功读取了'+ Model.CET6.length +'个单词！') ;
        } );
    } , 5 * 1000) ;
    
 }//局部代码结束
   Model.pos = 0 ; //pos用于记录系统的当前单词
   Model.users = [] ;
        { //预读本地硬盘的用户信息
            //假设本地localStorage对象的users属性存放用户信息
            let str = localStorage.getItem('users') ;
            if(str){
             let users = JSON.parse(str) ;
              Model.users = users ;
            }
          
           
        }

 let UI = {} ; //UI用于表达用户界面，以及改变用户界面上的的内容
   UI.printWord = function(){ //用于把当前单词（Model.pos存储的索引）显示出来
       //让全局变量与局部变量联系起来
            let CET6 = Model.CET6 ;
            let learning = Model.learning ;
            let pos = Model.pos ;
            let currentSn = parseInt(learning[pos].sn) ;

            select('p#en').textContent = CET6[currentSn].en ;
            select('p#pn').textContent = CET6[currentSn].pn ;
            let correctCn = CET6[currentSn].cn ;
            
            select('span#level').textContent = '难度: ' + learning[pos].level;
            //产生一个数组，包含5个单词的中文，其中一个是单词本身
            let cnArr = [] ;
            
            let ok = false ; //默认时，正确中文答案没有放置
            for(let i=0 ; i < 5 ; i++){
                let lv = Math.random() * (5 - i) ;
                if(lv < 1 && !ok ){
                    ok = true ;
                    cnArr.push(correctCn) ;
                }else{
                    let rand = Math.floor(Math.random() * CET6.length ) ;
                    cnArr.push(CET6[rand].cn) ;
                    }
             }//循环5次，产生中文随机数组
             if(!ok){
                    ok = true ;
                    cnArr[4] = correctCn ;
                }
               
            for(let i=1; i<6 ;i++){
               select('p#cn'+ i).textContent =  cnArr[i-1] ;
               select('p#cn'+ i).className = 'cn' ; //清楚用户在点击选择时产生的对、错样式
            }
        let s = "" ;
        if (learning[pos].timer){
          let d = learning[pos].timer ;
          s = '哟，您在'+ d.slice(0,2) +'年' +  d.slice(2,4)  + '月' + (d.slice(4))+ '日'+' 学过'  ; 
        }else{
            s = "哟，您这个单词没学过。"
        }
        
        UI.log(s + '--本组进度@'+ (pos+1)+'/' + Model.numOfLearning  +'.');

      } ;
    
 
  UI.log = function(s){
    select('p#log').textContent = s ;
  };
  UI.footerLog = function(s){
    select('footer').textContent = s ;
    setTimeout(() => {
        select('footer').textContent = "江西科技师范大学 李健宏 2024--2025" ;
    }, 3*1000);
  };
  UI.response = function(s){
    select('span#response').textContent = s ;
    setTimeout(() => {
        select('span#response').textContent = '' ;
    }, 2000);
  }
  UI.userStatus = function(){
    let easy = 0, normal = 0, hard=0 ;
    for(let word of Model.learned){
        if(word.level <= 0){
            easy ++ ;
        }else if(word.level < 3){
            normal ++ ;
         }else{
            hard ++ ;
         }
    }
    select('p#status span#user').textContent = Model.user ;
    select('p#status span#easy').textContent = easy ;
    select('p#status span#normal').textContent = normal ;
    select('p#status span#hard').textContent = hard ;

  } ;
  