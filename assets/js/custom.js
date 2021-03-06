var loader_div = $('#loader-wrapper');
var search_content_div = $('#search-results-wrapper .col-md-12');
var keterangan_div = $('#keterangan-wrapper');

jQuery.fn.fadeOutAndRemove = function(speed){
    $(this).fadeOut(speed,function(){
        $(this).remove();
    })
}

$(document).ready(function(){

    $('input.search').on('keypress', function (e) {
        if(e.which === 13){
            var name = $(this).val().trim();
            doSearchNow(name);
        }
    });

    $('#btn-reload').click(function(e){
        e.preventDefault();
        $('#default-wrapper').fadeOut();
        loader_div.show();
        
        $('#default-wrapper').load('kalender/load_default', function(){
            loader_div.hide();
            $(this).slideDown('fast');
        });

        return false;
    });
    
    $('#btn-back').click(function(e){
        e.preventDefault();
        $('#search-results-wrapper').fadeOut();
        $('#btn-reload-wrapper').fadeIn();
        loader_div.show();
        
        $('#default-wrapper').load('kalender/load_default', function(){
            loader_div.hide();
            keterangan_div.show('fast');
            $(this).slideDown('fast');
        });

        $('input.search').val('');
        $(this).parent().hide();
        search_content_div.empty();
        return false;
    });

});

function getCalendarModal(tanggal_event, total_event){
	if ($("#calendarmodal").data('bs.modal') && $("#calendarmodal").data('bs.modal').isShown){
        setTimeout(function(){
            // prepare modal body object
            var body = $('#calendarmodal .modal-body').find('#calendar-body');

            // loading content
            body.html(img_loader + ' Please wait . . . ');

            // get event list
            getEventList(body, tanggal_event, total_event);
        }, 900);
    }
}

function doSearchNow(name){
    search_content_div.empty();
    keterangan_div.hide();
    loader_div.show();
    $('#default-wrapper').fadeOut();
    $('#btn-reload-wrapper').fadeOut();

    // do search calendar
    searchName(name);
}

function searchName(name){
    setTimeout(function(){
        // ajax here
        $.ajax({
            type : "POST",
            url : 'kalender',
            data : {nama: name}
        }).done(function (response, textStatus, jqXHR) {
            loader_div.hide();
            // pencarian ditemukan
            if(response.trim()!==""){
                search_content_div.html(response);
            }
            // pencarian tidak ditemukan
            else{        
                search_content_div.html('<div class="alert alert-danger"><h4>Maaf, nama yang Anda cari tidak ditemukan dalam Kalender!</h4></div>');           
            }
            $('#search-results-wrapper').fadeIn();
            $('#btn-back-wrapper').fadeIn();
        }).fail(function (jqXHR, textStatus, errorThrown) {
            loader_div.hide();
            if(jqXHR.status==500){
                err_sts = jqXHR.status + ' (' + jqXHR.statusText + ')';
                err_msg = textStatus;
            }
            else{
                err_sts = jqXHR.status + ' (' + jqXHR.statusText + ')';
                err_msg = errorThrown;
            }
            search_content_div.html('Error Status: '+err_sts+'<br>'+'Error Message: '+'<br>'+err_msg);
            $('#search-results-wrapper').fadeIn();
            $('#btn-back-wrapper').fadeIn();
        });
    }, 500);
}

function getEventList(body, tanggal_event, total_event){

    // ajax here
    $.ajax({
        url: 'kalender/get_event_list/',
        type: "POST",
        data: {bulan_dan_tanggal: tanggal_event, total_event: total_event},
        success: function(response, textStatus, jqXHR){
            body.html(response);
            console.log(textStatus);
        },
        error: function(){
            alert('Error occured on AJAX request! Please try again later.');
        }
    });

}

function batalSimpan(obj){
    var form = $(obj).parent().parent().parent().find('form');
    form[0].reset();
}

function jadiSimpan(obj){
    if($('#saving-loader').is(':visible')==false){
        var form = $(obj).parent().parent().parent().find('form');
        var nama = $('#nama').val().trim();
        var thn = $('#tahun-lahir').val();
        var bln_tgl = $('#bulan-dan-tanggal').val();
        if(nama=="" || thn==""){
            alert('Semua input harus diisi!');
        }
        else{
            var fulldate = thn+'-'+bln_tgl;
            simpanDataBaru(form, nama, fulldate);           
        }
    }
    else{
        alert('Mohon tunggu proses simpan data sedang berjalan!');
    }
    return false;
}

function simpanDataBaru(form, nama, fulldate){
    $('#saving-loader').show();
    $.ajax({
        url: 'kalender/create_event/',
        type: "POST",
        data: {name: nama, birth_date: fulldate},
        success: function(response){
            if(response === 'success'){
                $('#saving-loader').hide();
                $('#addformmodal').modal('hide');
                form[0].reset();
                $('#calendarmodal .modal-body').prepend('<div id="notification" class="alert alert-success"><b>Suskes simpan data!</b><br>Silakan reload kalender untuk melihat perubahannya.</div>');
                $('#calendarmodal .modal-body #notification').fadeOutAndRemove(7000);
            }else{
                $('#saving-loader').hide();
                alert('Simpan gagal! Silakan ulangi beberapa saat kemudian.');
            }
            console.log(response);
        },
        error: function(){
            alert('Error occured on AJAX request! Please try again later.');
        }
    });
}
