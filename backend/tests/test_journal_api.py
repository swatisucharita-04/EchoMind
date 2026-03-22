import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.main import app
from app.core.auth import get_current_user
from app.db.base import get_db

@pytest.mark.asyncio
async def test_get_journal_entries(async_client):
    # Setup mock DB
    mock_db = AsyncMock()
    # Chain the mock so result.scalars().all() returns []
    mock_exec_result = MagicMock()
    mock_exec_result.scalars.return_value.all.return_value = []
    mock_db.execute.return_value = mock_exec_result

    async def override_get_db():
        yield mock_db

    # Override authentication and db
    app.dependency_overrides[get_current_user] = lambda: {"clerk_user_id": "test_user_123", "payload": {}}
    app.dependency_overrides[get_db] = override_get_db

    with patch("app.api.v1.journal.user_service.require_user", new_callable=AsyncMock) as mock_req_user:
        mock_req_user.return_value.id = 1
            
        response = await async_client.get("/api/v1/journal/")
        
        assert response.status_code == 200
        assert response.json() == []

    app.dependency_overrides.clear()
