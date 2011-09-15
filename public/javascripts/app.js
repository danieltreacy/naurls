$(document).ready(function() { 

	$('#source').focus();
	
	var shorten = function() {
		$.ajax({
			url: 'shorten',
			data: { u: $('#source').val() },
			type: 'GET',
			beforeSend: function() { 
				$('#preloader').show();
			},
			success: function(json) { 
				$('#source').val('');
				$('#preloader').hide();
				$('span.unique').text(json.key);
				$('#short').attr("href", "/" + json.key);
				$('#short').fadeIn();
			}
		})
	}
	
	
	$('#source').keypress(function(e) { 
		if (e.which == 13) {
			shorten();
		}
	});
		
});