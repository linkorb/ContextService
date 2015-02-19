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
    
    public function indexAction()
    {
        $data = array('ContextService' => 'is awesome');
        $response = new JsonResponse();
        $response->setData($data);
        return $response;
    }

    public function getIndexAction(Application $app, $account, $contextid)
    {

        
        $filename = $app['contextservice.datapath'] . '/account/' . $account . '/context/' . $contextid . '.json';
        if (!file_exists($filename)) {
            return $this->returnJsonError("No content found for this account + contextid");
        }
        $json = file_get_contents($filename);
        // Validate if the content is valid json
        $data = json_decode($json, true);
        
        switch ($app['contextservice.responsemode']) {
            case "json":
                $response = new JsonResponse();
                $response->setData($data);
                break;
            default:
                $response = new Response("window.ContextService.jsonpCallback(".json_encode($data).");");
                $response->headers->set('Content-Type', 'text/javascript');
                break;
        }
        return $response;
    }
    
    public function returnJsonError($message)
    {
        $data = array();
        $data['message'] = $message;
        $response = new JsonResponse();
        $response->setData($data);
        return $response;
    }

    public function demoAction()
    {
        $html = file_get_contents(__DIR__ . '/../Resources/views/demo.html');
        $response = new Response($html);
        return $response;
    }
}
