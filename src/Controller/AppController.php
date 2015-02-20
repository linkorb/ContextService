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
    public function indexAction()
    {
        $response = new JsonResponse();
        $response->setData(array('ContextService' => 'is awesome'));
        return $response;
    }

    public function getIndexAction(Application $app, $account, $contextid)
    {
        return $this->resposeByMode(
            $app,
            $this->getDataFromFile($app, $account, $contextid, 'context'),
            'context'
        );
    }
    
    public function getContentAction(Application $app, $account, $contentid)
    {
        return $this->resposeByMode(
            $app,
            $this->getDataFromFile($app, $account, $contentid, 'content'),
            'content'
        );
    }


    public function viewContentAction(Application $app, $account, $contentid)
    {
        $data = $this->getDataFromFile($app, $account, $contentid, 'content');
        if (gettype($data) === 'string') {
            return $this->returnJsonError($data);
        }

        $body = $data['body'];
        
        $html = file_get_contents($app['contextservice.datapath'] . '/account/' . $account . '/templates/layout.html');
        $html = str_replace("{{body}}", $body, $html);
        $response = new Response($html);
        return $response;
    }

    private function getDataFromFile(Application $app, $account, $id, $indexOrContent)
    {
        $type = ($indexOrContent == 'content') ? 'content' : 'context';
        $filename = $app['contextservice.datapath'] . '/account/' . $account . '/' . $type . '/' . $id . '.json';

        if (!file_exists($filename)) {
            return 'No content found for this account + ' . $type . 'id';
        }

        $json = file_get_contents($filename);
        // Validate if the content is valid json
        $data = json_decode($json, true);
        if ($indexOrContent == 'content') {
            $data['contentid'] = $id;
        }
        return $data;
    }

    private function resposeByMode($app, $data, $indexOrContent)
    {
        if (gettype($data) === 'string') {
            return $this->returnJsonError($data);
        }
        switch ($app['contextservice.responsemode']) {
            case "json":
                $response = new JsonResponse();
                $response->setData($data);
                break;
            default:
                if ($indexOrContent == 'content') {
                    $response = new Response("window.ContextService.jsonpContentCallback(".json_encode($data).");");
                } else {
                    $response = new Response("window.ContextService.jsonpIndexCallback(".json_encode($data).");");
                }
                $response->headers->set('Content-Type', 'text/javascript');
                break;
        }
        return $response;
    }

    public function returnJsonError($message)
    {
        $response = new JsonResponse();
        $response->setData(array('message' => $message));
        return $response;
    }

    public function demoAction()
    {
        return new Response(file_get_contents(__DIR__ . '/../Resources/views/demo.html'));
    }
}
