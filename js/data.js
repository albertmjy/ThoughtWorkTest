var PROD_TABLE = ""
$.getJSON("data/prod_table.json", function(data){
	// init the prod table
	PROD_TABLE = data
	// #details
	
	var table = $("<table class='table-condensed'>")
	
	// init the datalist
	var scanArea = $("#scan-area")
	var codeList = $("<datalist id='bar_code_list'>")
	$.each(data, function(k, row){
		var tr = $("<tr>")
		$.each(row, function(k, td) {
			$("<td>").text(td).appendTo(tr)
		});
		table.append(tr)
		
		if (k > 0){
			$("<option>").text(row[0]).val(row[0]).appendTo(codeList)
		}
	})
	console.log(table)
	$("#details").append(table)
	scanArea.append(codeList)
})


