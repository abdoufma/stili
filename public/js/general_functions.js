function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    document.cookie = cname + "=" + cvalue + "; expires="+ d.toUTCString()+" ;path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = decodeURIComponent(document.cookie).split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {	c = c.substring(1);	}
        if (c.indexOf(name) == 0) {	return c.substring(name.length, c.length);	}
    }
    return "";
}

function generate_random_string(type, length) {     
    var possible={
        all:"abcdefghijklmnopqrstuvwxyz0123456789",
        numbers:"0123456789",
        letters:"abcdefghijklmnopqrstuvwxyz"
    };
    possible=possible[type];
        
    var random_string="";
    for (var i = 0; i < length; i++)
        random_string += possible.charAt(Math.floor(Math.random() * possible.length));

    return random_string;
}


$(document).on('click','.open-panel', function(){
    fade_panel($('#'+$(this).data('panel')), true);
})

$(document).on('click','.close-panel', function(){
    fade_panel($(this).closest('.panel'), false);
})
  
$(document).on('click','.black-screen, .close-all-panels', function(){
    fade_panel($('.active-panel'),false);
});

function fade_panel($selector, boolean){
  
    $('#empty-panel-title').text($selector.find('.panel-header').text());

    if(boolean === false){
        $('#empty-panel').addClass('panel-slide-out').css('display','inline-block');
        $selector.css('display','none');
        setTimeout(function(){   $('#empty-panel').css('display','none')  },200);
        $selector.removeClass('active-panel');
        if($('.active-panel').length ==0){
            $('.black-screen').css('display','none');
        }
        return;
    }
    $('#empty-panel').removeClass('panel-slide-out');
    $('#empty-panel').addClass('panel-slide-in').css('display','inline-block');
    $selector.addClass('active-panel');
    setTimeout(function(){$('#empty-panel').css('display','none'); $selector.css('display','inline-block');}, 200);
    $('.black-screen').css('display','block'); 
}


function is_mobile(){
    if(GV.andrid == false){return false;}else{return true;}
}



function ajax(url, data, callback, error_callback, $button){
    ajax_button_loading($button, '');
    $.ajax({type: 'POST', url: url, data:data, 
        success:function(data){ console.log(data); callback(data); ajax_button_loading($button, 'success'); }, 
        error:function(err){ console.log(err); error_callback(err); ajax_button_loading($button, 'error'); },
       
    });
}


function ajax_button_loading($button, status){
    if($button == undefined){return;}
    $button.find('.btn-loading').remove();
    if(status == undefined || status == ""){
        $button.append('<div class="btn-loading"><img src="./images/orange-loading.gif" style="width:25px;"/></div>');
    }
    if(status == 'error'){
        $button.append('<div class="btn-loading">Erreur</div>');
    }
    if(status == 'success'){}
}

function check_form($button){
    var $form=$('.form[data-id="'+$button.attr('id')+'"]');
    if($form.length == 0){return true;}
    var error="";
    $form.find('input').each(function(){
        if($(this).val() == "" && $(this).hasClass('required')){
            $(this).css('border','2px solid red');
            error="empty";
        }else{
            $(this).css('border','none');
        }
    });
    if(error ==""){return true;}
    return false;
}


function carousel(selector,passed_options, callback){
    if(callback==undefined){callback=function(){};}
    $(selector).wrapInner('<div class="swiper-wrapper"></div>');
    $(selector).find('.carousel-element').addClass('swiper-slide');

    var options={  slidesPerView: 'auto',   freeModeSticky:true, freeMode:true, freeModeMomentumRatio:0.4	};
    if(passed_options != undefined){
        $.each(passed_options, function(option_title, option_value){
            options[option_title]=option_value;
        })
    }
    
    if(GV.swipers[selector] != undefined){	GV.swipers[selector].destroy(true, true); }
    GV.swipers[selector]= new Swiper (selector, options);
    
    GV.swipers[selector].on('slideChangeTransitionEnd', function () {
        var currentSlide = GV.swipers[selector].activeIndex;
        var gtag_value=JSON.stringify({current_slide:currentSlide, selector:selector });
        // gtag('event', 'slider_scroll', {	'event_category' : 'my_events', 'event_label':gtag_value});
        callback(currentSlide);
    });
}


function loading_html(){
    return `<div class="loading-container" ><img src="${GV.base_url}images/orange-loading.gif"/></div>`;
}


$(document).on('keyup','.form', function(e){
    if(e.keyCode == 13){      $(`#${$(this).data('id')}`).click();  }
});
    
    
    

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
/////////////////////////    MAP    //////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

$(document).on('click','.open-map', function(){
    fade_panel($('#map-panel'), true);
});
function initialize_map($selector, latitude, longitude, zoom, is_clickable){
    var mapProp = {
        center:new google.maps.LatLng(latitude,longitude),
        zoom:zoom,
        streetViewControl:false,
        zoomControl: true,
        mapTypeControl:false,
        fullscreenControl: false,
        mapTypeId:google.maps.MapTypeId.ROADMAP
        
    };
    
    var map=new google.maps.Map($selector[0], mapProp);

    var marker=new google.maps.Marker({  position:new google.maps.LatLng(latitude, longitude),});
    marker.setMap(map);

    if(is_clickable != false){
        google.maps.event.addListener(map, 'click', function(event) {
            marker.setPosition(event.latLng);
        });
    }
    var inputs=[$('#search-bar')[0], $('#map-panel-search')[0]];
    $.each(inputs, function(i,v){
        var autocomplete = new google.maps.places.Autocomplete(v, {componentRestrictions: {country: "dz"}});
        autocomplete.bindTo('bounds', map);
    
        autocomplete.addListener('place_changed', function() {
          var place = autocomplete.getPlace();
          if (!place.geometry) {  return; }
          GV.place_name= place.address_components[0].short_name +', '+place.address_components[1].short_name.replace('Wilaya d\'','').replace('Wilaya de','') ;
          GV.lati=place.geometry.location.lat();
          GV.longi=place.geometry.location.lng();
       
          marker.setPosition(place.geometry.location);
          marker.setVisible(true);
          map.setCenter(place.geometry.location);
            
          search_for_products(function(){
              $.each(GV.suppliers, function(i,v){
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(v.lati, v.longi),
                    icon: {                               url: GV.base_url+'images/marker-icon-blue.png'    },
                    map: map
                });
              });
          });
        
        });
    });
}




function calculate_distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="km") { dist = dist * 1.609344 }
		return dist.toFixed(1);
	}
}


function confirm_action(txt, callback){
    GV.confirmation_callback=callback;
    $('#confirmation-popup').remove();

    var html=`
        <div id="confirmation-popup" class="popup-container">
            <div class="popup">
                <div class="popup-header">
                    Confirmation
                </div>
                <div class="popup-content">
                    ${txt}
                </div>
                <div class="popup-footer">
                    <div class="btn close-popup" style="opacity:0.7; width:40%; margin-right:3%;" >Annuler</div
                    ><div id="confirm-action" class="btn close-popup" style=" width:50%;">Confirmer</div>
                </div>
            </div>
        <div>
    `;

    $('body').append(html);
    $('#confirmation-popup').fadeIn().css('display','flex');
}

$(document).on('click','.close-popup', function(){
    $(this).closest('.popup-container').fadeOut();
});

$(document).on('click','#confirm-action', function(){
    GV.confirmation_callback();
    GV.confirmation_callback=function(){};
});





$(document).on('click', '.next-frame, .back-frame', function(){
    var $frame=$(this).closest('.frame');
    var index=$frame.index();
    if($(this).hasClass('back-frame')){index=index-2;}

    if($frame.parent().find('.frame').eq(index).length ==0){return;}
    $frame.css('display','none');
    $frame.parent().find('.frame').eq(index).fadeIn();
});



$(document).on('click','.tab-button', function(){
    $(this).parent().find('.active-tab-button').removeClass('active-tab-button');
    $(this).toggleClass('active-tab-button');
});


function upload_image(file, callback){
    if(callback==undefined){callback=function(){};}
   
    var ajax = new XMLHttpRequest();
    $progress_bar= $('.upload-progress[data-file_id="'+file.name+''+file.lastModified+'"]');
    $progress_bar.parent().find('.image-name').val('');

	ajax.upload.addEventListener("progress", function (e) {
        var percent = (e.loaded / e.total) * 100;
        $progress_bar.html('('+Math.round(percent) + '%)');
	}, false);

	ajax.addEventListener("load", function (e) {
        var data= JSON.parse(e.target.response);
        $progress_bar.parent().find('.image-name').val(data.file_name);
        $progress_bar.remove();
    	callback(e, 'load');	
	}, false);

	ajax.addEventListener("error", function (e) {
        console.log(file.name, 'error');
		callback(e, 'error');
	}, false);

	ajax.addEventListener("abort", function (e) {
		console.log(file.name, 'Aborted');
		callback(e, 'abort');
	}, false);

	ajax.open("POST",  GV.base_url+'uploads');

	var formData = new FormData();
    formData.append('file', file);
	ajax.send(formData);
}
