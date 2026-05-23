<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
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
            ['name' => 'optimize:clear', 'parameters' => []],
            ['name' => 'migrate', 'parameters' => ['--force' => true]],
            ['name' => 'storage:link', 'parameters' => ['--force' => true]],
            ['name' => 'config:cache', 'parameters' => []],
            ['name' => 'view:cache', 'parameters' => []],
        ];

        if (request()->boolean('seed')) {
            $commands[] = ['name' => 'db:seed', 'parameters' => ['--force' => true]];
        }

        $results = [];

        foreach ($commands as $command) {
            try {
                $exitCode = Artisan::call($command['name'], $command['parameters']);

                $results[] = [
                    'command' => $command['name'],
                    'exit_code' => $exitCode,
                    'output' => trim(Artisan::output()),
                ];
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
}
