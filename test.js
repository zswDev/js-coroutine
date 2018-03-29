let getThid = ()=>java.lang.Thread.currentThread().getName()

for(let i=0;i<10;i++){
        Workers(()=>{ // 线程中执行,注意异常捕获
            //java.lang.Thread.sleep(Math.round(Math.random()*10000+5000))
            let id = getThid()
           postMessage(id,(v)=>{ //给主线程发消息
                print(getThid()+':'+v)
            })
        })
}
let t = Date.now()
setTimeout(()=>{
  print(Date.now()-t)
},1)
