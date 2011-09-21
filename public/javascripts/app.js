/*
 * Client-side JS
 */
$(function() { 

	$('#source').focus();
	
	var shorten = function() {
		$.ajax({
			url: 'shorten',
			data: { u: $('#source').val() },
			type: 'GET',
			beforeSend: function() { 
				$('#short').hide();
				$('.preloader').show();
			},
			success: function(json) { 
				$('.preloader').fadeOut();
				$('#source').val('naurls.me/' + json.key);
				// $('span.unique').text(json.key);
				// $('#short').attr("href", "/" + json.key);
				// $('#short').fadeIn();
			}
		})
	}
	
	$('#source').keypress(function(e) { 
		if (e.which == 13) {
			shorten();
		}
	});
	
});