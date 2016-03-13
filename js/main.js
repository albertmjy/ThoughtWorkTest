
(function() {
	// const PROD_TABLE

/************************ event handler ******************************/
	var scanHandler = {
		add_product: function(){
			var code = $("#bar-code").val()
			var codeList = $("#bar_code_list option")
			var rst = codeList.filter("option[value='" + code + "']")
			if (rst.length <= 0){
				alert("Bar code not found. It should be matching 'ITEM0000XX'")
				return
			}
			// add product to the list 
			var s = $("#scan-area")
			var code = s.find("#bar-code").val()
			var qt = s.find("#quantity").val()
			
			console.log(code, qt)
			var plist = $("#s-list")
			// check if the bar code already in the list
			var td = plist.find("td:contains('" + code +  "')")
			if (td.length>0){
				// already in the list
				var qtNode = td.next("td")
				console.log(qtNode)
				var origin = parseInt(qtNode.text())
				var newQt = origin + parseInt(qt)
				qtNode.text(newQt)
			} else {
				// add to the list
				var row = $("<tr>")
						.append($("<td></td>").text(code))
						.append($("<td></td>").text(qt))
						.append($("<td><a href='#'>X</a></td>"))
				plist.find("tbody").append(row)
			}
		}
	}
	
	var printHandler = {
		// parse the data to ["ITEM00001-x", "ITEM0000002-x", ... ]
		parseScanList: function(){
			var scanList = []
			var tb = $("#s-list tbody")
			var rows = tb.children("tr")
			$.each(rows, function(k, v) {
				var data = $(v).children("td")
				var item = data.eq(0).text().trim() + "-" + data.eq(1).text().trim()
				scanList.push(item)
			});
			console.log(scanList)
			return scanList
		},
		// calculate the scan data, output the ticket data 
		// input,  ["ITEM0000001-x", "ITEM0000002-x", ...]
		// output,  {list: [
		//	            name: "",
		//              quantity: "", 
		//              price: "", 
		//              sub_total: "",
		//              unit: "",
		//              discount:"",
		//              save: "",
		//              free_count: ""
		//           ], total: "", save: ""}
		calcCheckList: function(data){
			// IE9+ support
			var prod = data.map(function(it){
				return it.split("-")
			})
			
			// return json data
			var resultJson = {
				list: [],
				total: "",
				save: ""
			}
			
			var save_total = 0
			var total = 0
			// get the each product data by query the fake database..
			$.each(prod, function(k, item) {
				var code = item[0] // input code
				var qt = item[1]   // input product amount
				var idx = parseInt(code.substr(4)) // index in fake db
				var prod = PROD_TABLE[idx] 
				var price = prod[4]
				var unit = prod[5]
				
				var _sub_total = 0
				var _save = 0
				var _discount = 0
				var _freeCount = 0
				
				if (prod[2] == "1"){
					// buy 2 get 1 free
					_freeCount = parseInt(qt/3)
					_save = _freeCount * price
					_sub_total = (qt-_freeCount) * price
				} else {
					if(prod[3] == "1"){
						// discount
						_discount = qt * price * 0.05
						_sub_total = qt * price - _discount
					}
				}
				
				var list = {
					name: prod[1],
					quantity: qt,
					price: price,
					sub_total: _sub_total,
					unit: unit,
					discount: _discount,
					save:_save,
					free_count: _freeCount
				}
				console.log(list)
				
				resultJson.list.push(list)
				total += _sub_total
				save_total += _discount + _save
			});
			resultJson.total = total
			resultJson.save = save_total
			console.log(resultJson)
			return resultJson
		},
		
		// print the ticket, display it on the page
		// input,  {list: [
		//	            name: "",
		//              quantity: "", 
		//              price: "", 
		//              sub_total: "",
		//              unit: "",
		//              discount:"",
		//              save: "",
		//              free_count: ""
		//           ], total: "", save: ""}
		printTicket: function(data){
			var ticketPanel = $("#ticket-panel")
			ticketPanel.html("") // clear the panel
			var pdList = $("<div>") // product list
			var freeList = $("<div>") // free product list
			var hasFreeCount = false  // if has free product 
			// get the product lines info 
			$.each(data.list, function(k, v) {
				var ulProd = $("<ul>").append($("<li>").text("Name: " + v.name))
								.append($("<li>").text("Quantity: " + v.quantity +v.unit))
								.append($("<li>").text("Price: " + v.price))
								.append($("<li>").text("Subtotal: " + v.sub_total))
				if (v.discount > 0){
					ulProd.append($("<li>").text("Discount: " + v.discount))
				}
				pdList.append(ulProd)
				
				if (v.free_count > 0){
					hasFreeCount = true
					var ulFree = $("<ul>").append($("<li>").text("Name: " + v.name))
									.append($("<li>").text("Quantity: " + v.free_count +v.unit))
					freeList.append(ulFree)
				}
			});
			pdList.prepend($("<div>****XXX Store****</div>"))
				.append($("<div>-----------------</div>"))
			ticketPanel.append(pdList)
			
			// get the free product line info
			if (hasFreeCount){
				freeList.prepend($("<span>Free Count</span>"))
						.append($("<div>-----------------</div>"))
				ticketPanel.append(freeList)
			}
			
			// get the summary line info
			var summary = $("<div></div>")
			$("<ul>").append($("<li>").text("Total: " + data.total)).appendTo(summary)
			$("<ul>").append($("<li>").text("Save: " + data.save)).appendTo(summary)
			summary.append($("<div>*********************</div>"))
			ticketPanel.append(summary)
		}
	}

	/************************ event handler end ******************************/

	/************************ resiger event handler ******************************/
	$("#print").click(function(e){
		e.preventDefault()
		// get the data like ["ITEM0000001-x", "ITEM0000002-x", ...]
		var sList = printHandler.parseScanList()
		// ...ajax 
		// calculate the data 
		var resultJson = printHandler.calcCheckList(sList)
		// display it on the page
		printHandler.printTicket(resultJson)
	})
	
	$("#scan").click(function(){
		scanHandler.add_product()
	})
	
	$(".del").click(function(){
		console.log($(this).parents("tr"))
		$(this).parents("tr").remove()
	})
	/************************ resiger event handler end ******************************/
	
})()
