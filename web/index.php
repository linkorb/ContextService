<?php

use Symfony\Component\HttpFoundation\Request;

require_once __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__ . '/../app/bootstrap.php';

$request = Request::createFromGlobals();
$app->run($request);
