### Create Cloud Scheduler

```
gcloud scheduler jobs create http run-warmer \
 --schedule="*/3 * * * *" \
 --uri="https://us-central1-tubo-ca974.cloudfunctions.net/warmer" \
 --http-method=GET
```
