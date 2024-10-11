import boto3
import time

def lambda_handler(event, context):
    rds = boto3.client('rds')
    db_cluster_id = 'database-disaster-recovery'
    snapshot_id = f"{db_cluster_id}-snapshot-{int(time.time())}"
    
    try:
        response = rds.create_db_cluster_snapshot(
            DBClusterSnapshotIdentifier=snapshot_id,
            DBClusterIdentifier=db_cluster_id
        )
        print(f"Cluster snapshot {snapshot_id} created successfully!")
        return {
            'statusCode': 200,
            'body': f"Cluster snapshot {snapshot_id} created successfully!"
        }
    except Exception as e:
        print(f"Error creating cluster snapshot: {str(e)}")
        return {
            'statusCode': 500,
            'body': str(e)
        }
