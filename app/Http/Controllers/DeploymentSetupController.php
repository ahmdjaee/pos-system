<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Process\Process;
use Throwable;

class DeploymentSetupController extends Controller
{
    public function __invoke(string $token): JsonResponse
    {
        $expectedToken = (string) config('services.deployment.setup_token');

        if ($expectedToken === '' || ! hash_equals($expectedToken, $token)) {
            abort(404);
        }

        $commands = [
            ['type' => 'process', 'name' => 'composer install', 'command' => [
                'composer',
                'install',
                '--no-dev',
                '--no-interaction',
                '--prefer-dist',
                '--optimize-autoloader',
            ]],
            ['type' => 'process', 'name' => 'npm run build', 'command' => ['npm', 'run', 'build']],
            ['type' => 'artisan', 'name' => 'optimize:clear', 'parameters' => []],
            ['type' => 'artisan', 'name' => 'migrate', 'parameters' => ['--force' => true]],
            ['type' => 'artisan', 'name' => 'storage:link', 'parameters' => ['--force' => true]],
            ['type' => 'artisan', 'name' => 'config:cache', 'parameters' => []],
            ['type' => 'artisan', 'name' => 'view:cache', 'parameters' => []],
        ];

        if (request()->boolean('seed')) {
            $commands[] = ['type' => 'artisan', 'name' => 'db:seed', 'parameters' => ['--force' => true]];
        }

        $results = [];

        foreach ($commands as $command) {
            try {
                $results[] = $command['type'] === 'process'
                    ? $this->runProcess($command['name'], $command['command'])
                    : $this->runArtisan($command['name'], $command['parameters']);
            } catch (Throwable $exception) {
                $results[] = [
                    'command' => $command['name'],
                    'exit_code' => 1,
                    'output' => $exception->getMessage(),
                ];
            }
        }

        return response()->json([
            'ok' => collect($results)->every(fn (array $result) => $result['exit_code'] === 0),
            'seeded' => request()->boolean('seed'),
            'results' => $results,
        ]);
    }

    private function runArtisan(string $command, array $parameters): array
    {
        $exitCode = Artisan::call($command, $parameters);

        return [
            'command' => $command,
            'exit_code' => $exitCode,
            'output' => trim(Artisan::output()),
        ];
    }

    private function runProcess(string $name, array $command): array
    {
        $process = new Process($command, base_path(), [
            'COMPOSER_HOME' => storage_path('framework/cache/composer'),
            'NPM_CONFIG_CACHE' => storage_path('framework/cache/npm'),
        ]);
        $process->setTimeout(600);
        $process->run();

        return [
            'command' => $name,
            'exit_code' => $process->getExitCode(),
            'output' => trim($process->getOutput().PHP_EOL.$process->getErrorOutput()),
        ];
    }
}
