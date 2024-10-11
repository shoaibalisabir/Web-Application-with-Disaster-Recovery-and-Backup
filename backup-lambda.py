import boto3
import time

def lambda_handler(event, context):
    rds = boto3.client('rds')
    snapshot_id = f"todoapp-snapshot-{int(time.time())}"
    
    try:
        response = rds.create_db_snapshot(
            DBSnapshotIdentifier=snapshot_id,
            DBInstanceIdentifier='database-disaster-recovery-instance-1'
        )
        return f"Snapshot {snapshot_id} created successfully!"
    except Exception as e:
        return str(e)
