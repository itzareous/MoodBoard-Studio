import { useMemo } from 'react';
import type { ImageData } from '@/context/BoardContext';

interface AlignmentGuidesProps {
  draggedImage: ImageData | null;
  allImages: ImageData[];
  zoom: number;
  pan: { x: number; y: number };
}

interface Guide {
  type: 'vertical' | 'horizontal';
  position: number;
  label: string;
}

export default function AlignmentGuides({
  draggedImage,
  allImages,
  zoom,
  pan
}: AlignmentGuidesProps) {
  const guides = useMemo(() => {
    if (!draggedImage) return [];
    
    const guides: Guide[] = [];
    const SNAP_DISTANCE = 5;
    
    const dragLeft = draggedImage.x;
    const dragRight = draggedImage.x + draggedImage.width;
    const dragCenterX = draggedImage.x + draggedImage.width / 2;
    const dragTop = draggedImage.y;
    const dragBottom = draggedImage.y + draggedImage.height;
    const dragCenterY = draggedImage.y + draggedImage.height / 2;
    
    allImages.forEach(img => {
      if (img.id === draggedImage.id) return;
      
      const imgLeft = img.x;
      const imgRight = img.x + img.width;
      const imgCenterX = img.x + img.width / 2;
      const imgTop = img.y;
      const imgBottom = img.y + img.height;
      const imgCenterY = img.y + img.height / 2;
      
      // Vertical alignment guides (X-axis)
      if (Math.abs(dragLeft - imgLeft) < SNAP_DISTANCE) {
        guides.push({ type: 'vertical', position: imgLeft, label: 'Left' });
      }
      if (Math.abs(dragRight - imgRight) < SNAP_DISTANCE) {
        guides.push({ type: 'vertical', position: imgRight, label: 'Right' });
      }
      if (Math.abs(dragCenterX - imgCenterX) < SNAP_DISTANCE) {
        guides.push({ type: 'vertical', position: imgCenterX, label: 'Center' });
      }
      if (Math.abs(dragLeft - imgRight) < SNAP_DISTANCE) {
        guides.push({ type: 'vertical', position: imgRight, label: 'Edge' });
      }
      if (Math.abs(dragRight - imgLeft) < SNAP_DISTANCE) {
        guides.push({ type: 'vertical', position: imgLeft, label: 'Edge' });
      }
      
      // Horizontal alignment guides (Y-axis)
      if (Math.abs(dragTop - imgTop) < SNAP_DISTANCE) {
        guides.push({ type: 'horizontal', position: imgTop, label: 'Top' });
      }
      if (Math.abs(dragBottom - imgBottom) < SNAP_DISTANCE) {
        guides.push({ type: 'horizontal', position: imgBottom, label: 'Bottom' });
      }
      if (Math.abs(dragCenterY - imgCenterY) < SNAP_DISTANCE) {
        guides.push({ type: 'horizontal', position: imgCenterY, label: 'Middle' });
      }
      if (Math.abs(dragTop - imgBottom) < SNAP_DISTANCE) {
        guides.push({ type: 'horizontal', position: imgBottom, label: 'Edge' });
      }
      if (Math.abs(dragBottom - imgTop) < SNAP_DISTANCE) {
        guides.push({ type: 'horizontal', position: imgTop, label: 'Edge' });
      }
    });
    
    return guides.filter((guide, index, self) =>
      index === self.findIndex(g => 
        g.type === guide.type && g.position === guide.position
      )
    );
  }, [draggedImage, allImages]);
  
  if (guides.length === 0) return null;
  
  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 999 }}>
      {guides.map((guide, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            ...(guide.type === 'vertical'
              ? {
                  left: guide.position * zoom + pan.x,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  backgroundColor: '#EF4444',
                }
              : {
                  top: guide.position * zoom + pan.y,
                  left: 0,
                  right: 0,
                  height: '1px',
                  backgroundColor: '#3B82F6',
                }),
          }}
        />
      ))}
    </div>
  );
}
