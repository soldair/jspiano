<!DOCTYPE HTML/>
<html>
	<head></head>
	<body>
		<canvas id="c"></canvas>
		<script>
			var wavHeader = "<?=base64_encode(substr(file_get_contents('800hz.wav'),0,50))?>";
			var testResampled = "data:audio/wav;base64,<?=base64_encode(file_get_contents('test-resampled.wav'))?>"; 
		</script>
		<script src="app.js?<?=time()?>"></script>
	</body>
</html>
