import { defineConfig } from "cypress";
import { writeFileSync, readFileSync, unlinkSync, existsSync, mkdirSync, writeFile } from 'fs';
import { join } from 'path';

import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export default defineConfig({
    viewportWidth: 450,
    viewportHeight: 800,
    defaultCommandTimeout: 5000,


    e2e: {
        baseUrl: 'http://localhost:8080',

        setupNodeEvents(on, config) {
            on('task', {
                saveImage({ base64, fileName }) {
                    const dirPath = join(__dirname, 'cypress', 'screenshots');
                    const filePath = join(dirPath, fileName);

                    mkdirSync(dirPath, { recursive: true });
                    const buffer = Buffer.from(base64, 'base64');

                    return new Promise((resolve, reject) => {
                        writeFile(filePath, buffer, (err) => {
                            if (err) {
                                console.error('❌ Error al guardar imagen:', err);
                                return reject(err);
                            }
                            console.log('✅ Imagen guardada en:', filePath);
                            resolve(true);
                        });
                    });
                }
            });

            on('task', {
                compareImage({ actual, expected, diff, threshold = 0.1 }) {
                    const actualPath = join(__dirname, actual);
                    const expectedPath = join(__dirname, expected);
                    const diffPath = join(__dirname, diff);
                    console.log('actualPath', actualPath);
                    console.log('expectedPath', expectedPath);
                    if (!existsSync(actualPath) || !existsSync(expectedPath)) {
                        throw new Error('Una de las imágenes no existe');
                    }

                    const img1 = PNG.sync.read(readFileSync(actualPath));
                    const img2 = PNG.sync.read(readFileSync(expectedPath));

                    if (img1.width !== img2.width || img1.height !== img2.height) {
                        unlinkSync(actualPath); // 🗑️ eliminar la imagen actual
                        throw new Error('🔴[ERROR] The canvas are of different sizes');
                    }

                    const diffImg = new PNG({ width: img1.width, height: img1.height });

                    const numDiffPixels = pixelmatch(
                        img1.data, img2.data, diffImg.data,
                        img1.width, img1.height,
                        { threshold: threshold} // puedes ajustar esto
                    );

                    unlinkSync(actualPath); // 🗑️ eliminar la imagen actual

                    if (numDiffPixels > 0) {
                        writeFileSync(diffPath, PNG.sync.write(diffImg));
                        throw new Error('🔴[ERROR] The canvas are of different');
                    } else {
                        if (existsSync(diffPath)) {
                            unlinkSync(diffPath); // 🧹 limpiar diff anterior si existe
                        }
                    }


                    return {
                        iguales: numDiffPixels === 0,
                        diferentes: numDiffPixels,
                        diff: diffPath
                    };
                }
            });
            return config;
        },
    }
});
