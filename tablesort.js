function TableSort(id){
	this.tbl = document.getElementById(id);
	this.lastSortedTh = null;
	if(this.tbl && this.tbl.nodeName == "TABLE"){//判断是否存在且为表格
		var headings = this.tbl.tHead.rows[0].cells;
		for(var i=0;headings[i];i++){
			if(headings[i].className.match(/asc|dsc/)){
				this.lastSortedTh = headings[i];
			}
		}
		this.makeSortable();//让他排序
	}
}

TableSort.prototype.makeSortable = function(){
	var headings = this.tbl.tHead.rows[0].cells;//获取表头成员数组
	for(var i=0;headings[i];i++){
		headings[i].cIdx = i;//解决Safari2.0.4的bug导致对cellIndex的返回值永远为0。接下来为每个th元素外包一个a，让用户可以通过tab键激活表头，回车触发onclick事件
		var a = document.createElement("a");
			a.href = "#";
			a.innerHTML = headings[i].innerHTML;
			a.onclick = function(that){
				return function(){
					that.sortCol(this);
					return false;
				}
			}(this);//使用闭包指向TableSort实例
		headings[i].innerHTML = "";
		headings[i].appendChild(a);
	}
}

TableSort.prototype.sortCol = function(el){
	var rows = this.tbl.rows;//所有行
	var alpha = [],numeric = [];//该列所有格子的文字型内容和数值型内容分开存放于这两个数组中
	var aIdx = 0,nIdx = 0;//用于索引上面两个数组
	var th = el.parentNode;//这是被点击钩子的父节点引用，即th.钩子的引用是el，作为函数的参数传进来
	var cellIndex = th.cIdx;//这个变量存放th元素在其所在行的索引。通过它，可以直接跳到当前列在每行对应的格子，从而高效地遍历一列的所有格子
	for(var i=1;rows[i];i++){
		var cell = rows[i].cells[cellIndex];
		var content = cell.textContent ? cell.textContent : cell.innerText;//FF只支持textContent，IE只支持innerText
		var num = content.replace(/(\$|\,|\s)/g, "");//去除美元，逗号和空格等
		if(parseFloat(num) == num){//判断省下的是否是数值
			numeric[nIdx++] = {
				value:Number(num),
				row:rows[i]
			}
		}else{
			alpha[aIdx++] = {
				value:content,
				row:rows[i]
			}
		}
	}
//按方向进行排序
	var col = [],top,bottom;
	if(th.className.match("asc")){
		top = bubbleSort(alpha,-1);
		bottom = bubbleSort(numeric,-1);
		th.className = th.className.replace(/asc/,"dsc");
	}else{
		top = bubbleSort(numeric,1);
		bottom = bubbleSort(alpha,1);
		if(th.className.match("dsc")){
			th.className = th.className.replace(/dsc/,"asc");
		}else{
			th.className +="asc";
		}
	}
	//如果最近一次排序的表格列的th和被点击的不一样，就清楚他的asc/dsc类名
	if(this.lastSortedTh && th != this.lastSortedTh){
		this.lastSortedTh.className = this.lastSortedTh.className.replace(/dsc|asc/g,"");
	}
	this.lastSortedTh = th;
	col = top.concat(bottom);
	var tBody = this.tbl.tBodies[0];
	for(var i=0;col[i];i++){
		tBody.appendChild(col[i].row);
	}
}

function bubbleSort(arr,dir){
	var start,end;
	if(dir === 1){//dir的两个值，1和-1，分别代表升序和降序
		start = 0;
		end = arr.length;
	}else if(dir === -1){
		start = arr.length-1;
		end = -1;
	}
	var unsorted = true;
	while(unsorted){//冒泡排序
		unsorted = false;
		for(var i=start;i!=end;i=i+dir){
			if(arr[i+dir] && arr[i].value > arr[i+dir].value){
				var a = arr[i];
				var b = arr[i+dir];
				var c = a;
				arr[i] = b;
				arr[i+dir] = c;
				unsorted = true;
			}
		}
	}
	return arr;
}