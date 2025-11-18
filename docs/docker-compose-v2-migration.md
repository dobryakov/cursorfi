# Docker Compose V2 Migration Guide

## Проблема: KeyError 'ContainerConfig'

### Симптомы

При использовании `docker-compose` (V1) возникает ошибка:

```
KeyError: 'ContainerConfig'
File "/usr/lib/python3/dist-packages/compose/service.py", line 1579, in get_container_data_volumes
    container.image_config['ContainerConfig'].get('Volumes') or {}
    ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^
KeyError: 'ContainerConfig'
```

### Корневая причина

**Несовместимость версий:**

1. **Docker Compose V1** (старая версия, например 1.29.2) использует устаревший API для работы с метаданными образов
2. **Docker Engine** (новые версии, например 28.4.0) изменил структуру метаданных образов
3. Docker Compose V1 пытается обратиться к `image_config['ContainerConfig']`, которого больше нет в новой структуре

### Решение

**Использовать Docker Compose V2** вместо V1:

- **V1 (устаревший):** `docker-compose` (отдельная утилита)
- **V2 (рекомендуемый):** `docker compose` (встроенная команда Docker)

### Проверка версий

```bash
# Проверить версию Docker Compose V1 (если установлен)
docker-compose --version

# Проверить версию Docker Compose V2 (встроен в Docker)
docker compose version
```

### Миграция

1. **Удалить устаревший `version` из docker-compose.yml:**

   Docker Compose V2 не требует указания версии файла. Удалите строку:
   ```yaml
   version: '3.8'  # Удалить эту строку
   ```

2. **Использовать `docker compose` вместо `docker-compose`:**

   ```bash
   # Старый способ (V1)
   docker-compose up -d
   
   # Новый способ (V2)
   docker compose up -d
   ```

3. **Обновить скрипты и документацию:**

   Заменить все упоминания `docker-compose` на `docker compose` в:
   - README.md
   - Скриптах
   - CI/CD конфигурациях
   - Документации

### Преимущества Docker Compose V2

- ✅ Совместимость с новыми версиями Docker
- ✅ Встроен в Docker (не требует отдельной установки)
- ✅ Улучшенная производительность
- ✅ Лучшая поддержка новых функций Docker
- ✅ Активная разработка и поддержка

### Обратная совместимость

Docker Compose V2 полностью совместим с файлами `docker-compose.yml`, созданными для V1, за исключением:
- Атрибут `version` больше не требуется (игнорируется с предупреждением)
- Некоторые устаревшие опции могут быть удалены в будущем

### Дополнительные ресурсы

- [Docker Compose V2 Documentation](https://docs.docker.com/compose/)
- [Migration Guide](https://docs.docker.com/compose/migrate/)

