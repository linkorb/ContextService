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
        $data = array('ContextService' => 'is awesome');
        $response = new JsonResponse();
        $response->setData($data);
        return $response;
    }

    public function fetchIndexAction(Request $request, $account, $contextid)
    {
        $data = array('account' => $account, 'content' => 'This is the message content of <b>'.$contextid.'</b>.');
        return new Response("window.ContextService.jsonpCallback(".json_encode($data).");");
    }

    public function demoAction(Request $request)
    {
        $html = file_get_contents(__DIR__ . '/../Resources/views/demo.html');
        $response = new Response($html);
        return $response;
    }
}
