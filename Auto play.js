/*
版本：1.0
原作者：Yojae|沐风
二次修改：懒声
支持：由剪切板或从乐谱文件夹(手机根目录/Download/SkyMsToJs/ms/)导入的
     由《光遇乐谱转js》生成的【乐谱/以txt形式将乐谱保存成的文件】、
     由《Sky Studio》生成的【json类型代码/文件】、
     由《光遇乐谱转js》生成的【js代码/文件】。
*/
var 是否显示悬浮窗 = "是" //显示则为"是"，不想显示请改为要等待的毫秒数，如"3000"
var sheetPath = "/sdcard/脚本/" //默认乐谱存放路径
var zuobiaoPath = "/sdcard/脚本/zuobiao.txt";   //坐标存放路径
if (files.exists(zuobiaoPath)) {
    eval(files.read(zuobiaoPath));        //eval执行//
} else {
    setScreenMetrics(1080, 2340);
    var x = [780, 975, 1170, 1365, 1560];
    var y = [215, 410, 605];
}
var showNames = ["(在Auto.js主界面)从剪切板导入..."];
files.ensureDir(sheetPath)                     //确定路径sheetpath所在的文件存在，若不存在则自动创建
var data = files.listDir(sheetPath)         //列出sheetpath路径下所有文件和文件夹的名称的数组
data.sort(function(a, b) {
    return a.localeCompare(b)
})                                                       //a,b以特定规则排序
for (i = 0; i < data.length; i++) {
   if (data[i].search(".txt") != -1 | data[i].search(".js") != -1&& data[i].search(".bak") == -1) {             //判断data数组中是否存在含有字符串".txt"".js"并排除含有"bak"的元素
        showNames.push(data[i]);                              //在showname这个数组后面加上data这个数组里符合上述条件的元素
    }
}
if (showNames.length == 1) {
    showNames.push("请将乐谱存放至乐谱文件夹：" + sheetPath + "");
}
var choose = dialogs.select("选择乐谱", showNames)
if (choose != -1) {
    if (choose == 0) { //获取剪切板内文本
        importClass(android.content.Context)
        data = context.getSystemService(Context.CLIPBOARD_SERVICE).getText()
        if (data == null) {
            toast("请在Auto.js主界面运行导入！");
            exit();
        }else if(type(data)=="unknow"){
            toast("不支持该类型文本！");
            exit();
        }
        dialogs.input("请输入文件名", "0", function(name) {
            if (name!=null){
                let path = sheetPath + name + ".txt";
                if (!files.create(path)) {
                    path = sheetPath + name + "（1）.txt";
                    toast("文件已存在，已将该文件重命名");
                };
                files.write(path, data);
                toast("已保存")
            }
        });
        exit()
    } else if (data.length == 0) {
        toast(showNames[choose]);
        exit();
    } else {
        data = files.read(sheetPath + showNames[choose], encoding = "utf-8")
        data1 = files.read(sheetPath + showNames[choose], encoding = "utf-16")
        if (data1.indexOf("songNotes") != -1) {
            data = data1
        }
    }
    if (data.indexOf("remove") != -1 | data.indexOf("delete") != -1 | data.indexOf("sojson") != -1) {
        toast("发现恶意代码，已终止运行！");
        engines.stopAll()
    }
    run(data)
} else {
    toast("你没有选谱子")
}

function type(txt) {     
    txt=String(txt);
    if (txt.match(/】\d+\,\d+\,\d+【/g)!=null) { //如果是《光遇乐谱转js》乐谱
        return "skyms"
    } else if (txt.indexOf("songNotes") != -1) { //如果是sky studio乐谱
        return "skystudio"
    } else if (txt.indexOf("点一下隔100ms") != -1 | txt.indexOf("keyboard") != -1) { //如果是《光遇乐谱转js》转换的js或者懒声制作的乐谱
        return "js"
    } else if (txt.indexOf("press\(") != -1 && txt.indexOf("sleep\(") != -1) { //如果是其他js代码
        return "skymstojs"
    } else {
        return "unknow"
    }
}

function run(txt) {
    var time3 = 100;
    switch (type(txt)) {
        case "skyms":
            times = txt.match(/】\d+\,\d+\,\d+【/g);
            times = eval(times.toString().replace(/【/g, '\]').replace(/】/g, '\['));
            var time = times[0];
            var time1 = times[1];
            var time2 = times[2];
            var sheet = txt.match(/.*?【间隔】/g).toString().replace(/【间隔】/g, '').replace(/\&/g, '').replace(/\-/g, 't1').replace(/\~/g, 't2').replace(/\,/g, 't3').replace(/\*/g, 't4').replace(/[a-t]\d+/g, function(x) {
                return '"' + x + '",'
            });
            sheet = eval("[" + sheet + "]")
            break;
        case "skystudio":
            data = JSON.parse(txt)[0];
            var speed = data.bpm;
            var time = Math.floor(30000 * 4 / speed);
            var time1 = Math.floor(15000 * 4 / speed);
            var time2 = Math.floor(60000 * 4 / speed);
            data = data.songNotes;
            var sheet = [];
            var lastTime = 0;
            var keys = ["c4", "d4", "e4", "f4", "g4", "a4", "b4", "c5", "d5", "e5", "f5", "g5", "a5", "b5", "c6"]
            for (var i = 0; i < data.length; i++) {
                now = data[i];
                nowTime = now.time;
                duration = Number(nowTime) - Number(lastTime);
                while (duration >= 10) {
                    if (duration >= time2 - 10) {
                        duration = duration - time2
                        sheet.push("t3");
                    } else if (duration >= time - 10) {
                        duration = duration - time
                        sheet.push("t1");
                    } else if (duration >= time1 - 10) {
                        duration = duration - time1
                        sheet.push("t2");
                    } else {
                        print(duration)
                        duration = duration - time3
                        sheet.push("t4");
                        toast("转换时出现了问题")
                    }
                }
                nowPitches = now.key;
                nowPitches = nowPitches.slice(4, nowPitches.length)
                sheet.push(keys[Number(nowPitches)]);
                lastTime = nowTime;
            }
            break;
        case "skymstojs":
            var times = txt.match(/time+\=.*?\n/g);
            if (times != null && times.toString().indexOf("time1") != -1) {
                eval(times.toString());
                var sheet = txt.slice(txt.indexOf("点一下隔100ms"), txt.length).replace("点一下隔100ms\n", "")
                sheet = sheet.replace(/\(\)\;/g, '').replace(/[a-t]\d+/g, function(x) {
                    return '"' + x + '",'
                });
                sheet = eval("[" + sheet + "]")
            } else {
                toast("该js代码缺少间隔参数");
                exit()
            }
            break;
        case "js":
            engines.execScript("统一弹奏", txt)
            exit();
            break;
        case "unknow":
        alert("暂不支持运行当前导入的内容！");
        exit();
        break;
    };
    var s=1;var progressNow=0;var speedControl=1;window=null
    if (是否显示悬浮窗=="是"){
        sleep(1);var window = floaty.window(<frame><vertical><button id="btn" text='暂停'/><horizontal><button id="speedLow" text='减速'w="80"/><button id="speedHigh" text='加速'w="80"/></horizontal><horizontal><button id="speed" text='x1'w="80"/><button id="stop" text='停止'w="80"/></horizontal><seekbar id="seek"/><text text="00:00/00:00" background="#FF5A5A5C" gravity="center" id="jd"/></vertical></frame>);window.exitOnClose();
        window.btn.click(()=>{if (window.btn.getText() != '暂停') {s = 1;window.btn.setText('暂停')} else {s = 0;window.btn.setText('继续')}})
        window.speedHigh.click(()=>{speedControl=(speedControl*10+1)/10;window.speed.setText("x"+speedControl)})
        window.speedLow.click(()=>{if(speedControl<=0.1){return};speedControl=(speedControl*10-1)/10;window.speed.setText("x"+speedControl)})
        window.speed.click(()=>{speedControl=1;window.speed.setText("x"+speedControl)})
        window.stop.click(()=>{engines.stopAll()})
        window.seek.setMax(sheet.length)
        window.seek.setOnSeekBarChangeListener(new android.widget.SeekBar.OnSeekBarChangeListener({	onProgressChanged: function(sb, p) {progressNow=p;window.jd.setText(timeSum(p)+"/"+timeSum(sb.getMax()));	},}))
        function timeSum(p){let timeTotal=0;for(var i=0;i<p;i++){switch (sheet[i]) {case "t1":timeTotal+=time/speedControl;break;case "t2":timeTotal+=time1/speedControl;break;case "t3":timeTotal+=time2/speedControl;break;case "t4":timeTotal+=time3/speedControl;break;}}let minute = 0;let second = timeTotal/1000;if (second>59) {minute = parseInt(second / 60);second = second % 60;};return  (Array(2).join(0) + minute.toFixed(0)).slice(-2)+":"+ (Array(2).join(0) + second.toFixed(0)).slice(-2)}
        window.jd.setText("00:00/"+timeSum(sheet.length))
    }else if(是否显示悬浮窗=="否"){
    }else if(!isNaN(Number(是否显示悬浮窗))){
        sleep(Number(是否显示悬浮窗));
    }else{
        toast("未按照要求修改“是否显示悬浮窗”的值")
        exit();
    };
    function ran(){return Math.random()*36-18}
    function c4() {press(x[0]+ran(),y[0]+ran(),1)}
    function d4() {press(x[1]+ran(),y[0]+ran(),1)}
    function e4() {press(x[2]+ran(),y[0]+ran(),1)}
    function f4() {press(x[3]+ran(),y[0]+ran(),1)}
    function g4() {press(x[4]+ran(),y[0]+ran(),1)}
    function a4() {press(x[0]+ran(),y[1]+ran(),1)}
    function b4() {press(x[1]+ran(),y[1]+ran(),1)}
    function c5() {press(x[2]+ran(),y[1]+ran(),1)}
    function d5() {press(x[3]+ran(),y[1]+ran(),1)}
    function e5() {press(x[4]+ran(),y[1]+ran(),1)}
    function f5() {press(x[0]+ran(),y[2]+ran(),1)}
    function g5() {press(x[1]+ran(),y[2]+ran(),1)}
    function a5() {press(x[2]+ran(),y[2]+ran(),1)}
    function b5() {press(x[3]+ran(),y[2]+ran(),1)}
    function c6() {press(x[4]+ran(),y[2]+ran(),1)}
    function t1() {while (s != 1) {sleep(100)};sleep(time/speedControl)}//默认间隔-
    function t2() {while (s != 1) {sleep(100)};sleep(time1/speedControl)}//较短间隔~
    function t3() {while (s != 1) {sleep(100)};sleep(time2/speedControl)}//较长间隔,
    function t4() {while (s != 1) {sleep(100)};sleep(time3/speedControl)}//自定义间隔*点一下隔100ms
    for(var i=0;i<sheet.length;i++){
        if (是否显示悬浮窗=="是"){
            if (progressNow!=i){i=progressNow}else{window.seek.setProgress(i)}
            if (i>=sheet.length-1||i<=0){i=s=progressNow=0;window.btn.setText('继续');window.seek.setProgress(0);t4()}
        }else{
            if (i>=sheet.length-1){exit()}
        }
        eval(sheet[i]+"()");
        progressNow++;
    }

}
