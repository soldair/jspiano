<!DOCTYPE HTML/>
<html>
	<head>
		<title>My js piano in a little bit o code</title>
	</head>
	<body>
		<h1>JAVASCRIPT PIANO</h1>
		<a href="http://github.com/soldair/jspiano">get this code on github</a>
		<div>
			to play use the keyboard keys "awsedftgyhuj" the non js1k version supports clicking piano keys on a canvas piano.
			<br/>
			please note that my intention was always to use this as a js1k submission so please excuse the lack of pbvious features and forgive the drop of nice to have features in the 1k version.
		</div>
		<div>
		<?
		if(isset($_GET['js1k'])){
			?><a href="?">view regular version</a><?
		} else {
			?><a href="?js1k=1">view js1k contest version</a><?
		}
		?>
		</div>
		<canvas id="c"></canvas>
		<?
		if(isset($_GET['js1k'])){
			?>
			<script><?=file_get_contents('js1k.js')?></script>
			<?
		} else {
			?>
			<script src="app.js"></script>
			<?
		}
		?>
		<?/*<script id="compiled"></script>*/?>
		<!--
		fyi png packed and base 64 encoded my app was 6 bytes or so longer

		<hr/>
		<canvas id="packer"></canvas>
		<script src="pngpacker.js?<?=time()?>"></script>
		-->
	</body>
</html>
