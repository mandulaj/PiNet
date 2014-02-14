
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
    </div>
    
    <div class="piStats">
    <h4>Pi Stats</h4>
    </div>
    
    <div id="stream">
    <div id="live">LIVE<div></div></div>
    <script type="text/javascript">
		var url = document.URL.split("/");
		url = url[0] + "//"+url[2];
        var imageURL = url + ":8080/?action=stream";
        document.write('<img id="liveStream" src="'+imageURL+'"  onError="$(\'#live\').hide();this.onerror=null;this.src=\'images/offline.jpg\';">')
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
    
    
    <script type="text/javascript">
        var upkey = document.getElementById("upkey");
        var downkey = document.getElementById("downkey");
        var leftkey = document.getElementById("leftkey");
        var rightkey = document.getElementById("rightkey");
        var slidthing = document.getElementById("grabthing");
        
    </script>
</div>