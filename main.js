importPackage(java.io)

/*
 threadPool
 loop
 require
*/

function read(path){
    let file = new File(path)
    if(file.isFile&&file.exists){
        let fins = new FileInputStream(file)
        let isr = new InputStreamReader(fins,'utf-8')
        let buf = new BufferedReader(isr)
        let s,sbuf = new java.lang.StringBuilder()
        while((s=buf.readLine())!=null){ //一次读一行
            sbuf.append(java.lang.System.lineSeparator()+s)
        }
        buf.close()
        return sbuf.toString()
    }
    return 'no file'
}
cached={}
const require=(path)=>{
    let _cache = cached[path]
    let Mod = function(){
        this.exports={}
    }
    if(_cache){
        if(_cache.load)return _cache.done
        return undefined 
    }
    let fstr = read(path)
    let fobj = new Function('module','exports',fstr) 
    cached[path] = {load:false, done:fobj}
    let mod = new Mod()

    fobj(mod,mod.exports) 

    cached[path].load = true
    cached[path].done = mod.exports
    return cached[path].done
}

const sleep = ()=> java.lang.Thread.sleep(1)
let getThid = ()=>java.lang.Thread.currentThread().getName()
const lock_q = new java.util.concurrent.locks.ReentrantLock()
const lock_t = new java.util.concurrent.locks.ReentrantLock()
const newFixedThreadPool = java.util.concurrent.Executors.newFixedThreadPool(4)

const queue = []
const Tqueue = [] 
let runLen = 0 
let trunlen = 0 
function runTask(_f){//main
    runLen++
    newFixedThreadPool.execute(new java.lang.Runnable({
        run:function(){
            _f && _f()
        }
    }))
}
function endTask(){
    runLen--
    if(runLen == 0){
        newFixedThreadPool.shutdown()
        print('pool exit')
    }
}
function Sync(val,cb){
    lock_q.lock()
    let qlen = queue.length
    let _f = (param)=>{
        cb && cb(param)
        endTask()
    }
    queue[qlen++] = [val,_f] 
    lock_q.unlock()
}
function TrunTast(cb,len){
    if(len==0 || len<0){
        len = 1
    }
    let _frun = ()=>{
        cb && cb()
        trunlen --
    }
    Tqueue.push([Date.now()+len, _frun])
    trunlen++
}
function loop(){
    let jlen = 1
    while(true){
        if(runLen == 0 && trunlen == 0){
            print('exit loop--------------')
            return 
        }
        let tlen = Tqueue.length
        for(let k=0; k<tlen; k++){
            let _twork = Tqueue[k]
            if(_twork){
                if(java.lang.System.currentTimeMillis() >= _twork[0]){
                    _twork[1]() 
                    Tqueue[k] = null
                }
            }
        }

        let qlen = queue.length
        for(let j=0; j<qlen; j++){
            let _work = queue[j]
            if(_work){
                _work[1](_work[0]) 
                queue[j] = null
            }
        }
        jlen++
        if(jlen == 256){
            sleep()
            jlen=0
        }
    }
}
Workers = runTask
postMessage = Sync
setTimeout = TrunTast

function getcmd(){
    let scan = java.util.Scanner(java.lang.System.in)
    if(scan.hasNext()){
        let str = scan.next()
        if(str){
            print('>>:')
            try{
            require(str+'.js')
            }catch(e){
                print(e)
            }
            loop() 
            cached = {}
            getcmd()
        }
    }
}
getcmd()