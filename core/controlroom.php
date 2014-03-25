<div class="cover"></div>

<div class="rec_window"> 
	The Recordings
    <div id="rec_window_close"></div>
    
	<div id="rec_window_content">
    
    </div>
</div>


<div class="content">
	<div class="sideBar">
    	<div class="showsideBar"><span>&gt;</span> </div>
        
    	<div class="lightSwitch">
			Off    
    	</div>
        <span>Lights</span>
        
        <div class="ai">
			Off    
    	</div>
        <span>AI</span>
        
        <div class="rec">
			Off    
    	</div>
        <span>REC</span>
        <div class="rec_view">
			View    
    	</div>
        <span>All Recordings</span>
    </div>
    
    <div class="piStats visible-sm visible-md visible-lg">
        <h4>Pi Stats</h4>
        <h5>CPU</h5>
        <span class="stat_title">Boot time: </span><span class="stat_val" id="stat_boot">-</span> <br>
        <span class="stat_title">CPU Load: </span><span class="stat_val" id="stat_load">0%</span> <br>
        
        
        <h5>RAM</h5>
        <span class="stat_title">Free RAM: </span><span class="stat_val" id="stat_freeRam">0%</span> <br>
        <span class="stat_title">Total RAM: </span><span class="stat_val" id="stat_totalRam">0GB</span> <br>
    </div>
    
    <div id="stream">
    <div id="live">LIVE<div></div></div>
    <script type="text/javascript">
		var url = document.URL.split("/");
		url = url[0] + "//"+url[2];
        var imageURL = url + ":8080/?action=stream";
        document.write('<img id="liveStream" class="img-responsive" src="'+imageURL+'"  onError="$(\'#live\').hide();this.onerror=null;this.src=\'images/offline.jpg\';">')
    </script> 
        <!--<img src="http://10.0.0.2:8080/?action=stream" alt="Stream"> -->
    </div>
    
    <div id="slider">
        <div id="track"></div>
        <div id="grabthing"><p id="speedVal">100%</p></div>
        
    </div>
    
    <div id="arrows">
        <table>
            <tr>
                <td></td>
                <td><div class="arrowkey" id="upkey"></div></td>
                <td></td>
            </tr>
            <tr>
                <td><div class="arrowkey" id="leftkey"></div></td>
                <td><div class="arrowkey" id="downkey"></div></td>
                <td><div class="arrowkey" id="rightkey"></div></td>
            </tr>
        </table>
    
    </div>
    
    <div id="cam_arrows">
        <table>
            <tr>
                <td></td>
                <td><div class="cam_arrowkey" id="cam_upkey"></div></td>
                <td> <div id="laser"></div></td>
            </tr>
            <tr>
                <td><div class="cam_arrowkey" id="cam_leftkey"></div></td>
                <td><div class="cam_arrowkey" id="cam_default"></div></td>
                <td><div class="cam_arrowkey" id="cam_rightkey"></div></td>
            </tr>
            <tr>
                <td></td>
                <td><div class="cam_arrowkey" id="cam_downkey"></div></td>
                <td></td>
            </tr>
        </table>
    
    </div>
    
   
    
    
    <script type="text/javascript">
        var upkey = document.getElementById("upkey");
        var downkey = document.getElementById("downkey");
        var leftkey = document.getElementById("leftkey");
        var rightkey = document.getElementById("rightkey");
        
        var cam_upkey = document.getElementById("cam_upkey");
        var cam_downkey = document.getElementById("cam_downkey");
        var cam_leftkey = document.getElementById("cam_leftkey");
        var cam_rightkey = document.getElementById("cam_rightkey");
        var cam_default = document.getElementById("cam_default");
        
        var slidthing = document.getElementById("grabthing");
    </script>
</div>