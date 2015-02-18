<?php

use ContextService\Server\Application;
use Symfony\Component\HttpFoundation\Request;

/** show all errors! */
ini_set('display_errors', 1);
error_reporting(E_ALL);

$basepath = __DIR__ . '/..';
$application = new Application(
    array (
        'contextservice.basepath' => $basepath
    )
);

return $application;
