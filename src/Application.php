<?php

namespace ContextService\Server;

use Silex\Application as SilexApplication;
use Symfony\Component\HttpFoundation\Request;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\Routing\Loader\YamlFileLoader;
use Symfony\Component\Yaml\Parser as YamlParser;

use RuntimeException;

class Application extends SilexApplication
{
    public function __construct(array $values = array())
    {
        parent::__construct($values);

        $this->configureParameters();
        $this->configureApplication();
        $this->configureRoutes();
        // $this->configureProviders();
        // $this->configureServices();
        // $this->configureSecurity();
        // $this->configureListeners();
    }
    
    private function configureParameters()
    {
        $this['debug'] = true;
    }
    
    private function configureApplication()
    {
        // Load defaults, in case configuration is missing
        $this['contextservice.baseurl'] = 'http://localhost:8787';
        $this['contextservice.datapath'] = $this['contextservice.basepath'] . '/example';
        $this['contextservice.responsemode'] = 'script';

        $configfilename = __DIR__ . '/../config.json';
        if (file_exists($configfilename)) {
            $json = file_get_contents($configfilename);
            $config = json_decode($json, true);
            if (isset($config['datapath'])) {
                $this['contextservice.datapath'] = $config['datapath'];
            }
            if (isset($config['baseurl'])) {
                $this['contextservice.baseurl'] = $config['baseurl'];
            }
        }
    }

    private function configureRoutes()
    {
        $locator = new FileLocator(array($this['contextservice.basepath'] . '/app'));
        $loader = new YamlFileLoader($locator);
        $this['routes'] = $loader->load('routes.yml');
    }
    /*
    private function configureProviders()
    {
    }
    
    private function configureServices()
    {
        //$service = new Service('http://localhost:8787');
        //$this['contextservice.service'] = $service;
    }
    
    private function configureSecurity()
    {
    }
    
    private function configureListeners()
    {
    }
    */
}
