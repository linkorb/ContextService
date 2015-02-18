<?php

namespace ContextService\Server\Controller;

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use RuntimeException;

class AppController
{
    private $baseurl;
    
    public function indexAction(Application $app, Request $request)
    {
        $data = array("cool" => "awesome");
        $response = new JsonResponse();
        $response->setData($data);
        return $response;
    }
}
